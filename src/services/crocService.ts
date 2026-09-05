import { AppStateData } from '../types/curriculum';

export interface CrocBridgeStatus {
  ok: boolean;
  service?: string;
  version?: string;
  activeUrl?: string;
  error?: string;
}

export interface CrocExportResult {
  success: boolean;
  browserUrl: string;
  token: string;
  code: string;
  expires: string;
  error?: string;
}

export interface CrocImportResult {
  success: boolean;
  data?: AppStateData;
  filename?: string;
  error?: string;
}

const STORAGE_KEY_CUSTOM_BRIDGE = 'art_street_croc_bridge_url';

export function getCustomBridgeUrl(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_BRIDGE);
  } catch {
    return null;
  }
}

export function setCustomBridgeUrl(url: string | null): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_BRIDGE, url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_BRIDGE);
    }
  } catch (e) {
    console.warn('Could not persist custom bridge URL:', e);
  }
}

/**
 * Normalizes input: handles full GetCroc URLs, store tokens, or simple relay code phrases.
 */
export function normalizeCrocInput(input: string): {
  type: 'store_url' | 'store_token' | 'relay_code' | 'unknown';
  cleaned: string;
  tokenEquivalent?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'unknown', cleaned: '' };
  }

  // Case 1: https://getcroc.com/s/<ID>#v1.<KEY>
  const storeUrlMatch = trimmed.match(/^https?:\/\/([^/]+)\/s\/([a-zA-Z0-9_-]+)#v1\.([a-zA-Z0-9_-]+)$/);
  if (storeUrlMatch) {
    const origin = `https://${storeUrlMatch[1]}`;
    const originB64 = btoa(origin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const id = storeUrlMatch[2];
    const key = storeUrlMatch[3];
    const token = `croc-store-v1.${originB64}.${id}.${key}`;
    return {
      type: 'store_url',
      cleaned: trimmed,
      tokenEquivalent: token,
    };
  }

  // Case 2: Query param URL format https://getcroc.com/?code=<CODE>
  const queryMatch = trimmed.match(/[?&]code=([a-zA-Z0-9_-]+)/);
  if (queryMatch) {
    return {
      type: 'relay_code',
      cleaned: queryMatch[1],
      tokenEquivalent: queryMatch[1],
    };
  }

  // Case 3: Token format croc-store-v1...
  if (trimmed.startsWith('croc-store-v1.')) {
    return {
      type: 'store_token',
      cleaned: trimmed,
      tokenEquivalent: trimmed,
    };
  }

  // Case 4: Raw relay code phrase (e.g. stood-stuck-last)
  return {
    type: 'relay_code',
    cleaned: trimmed,
    tokenEquivalent: trimmed,
  };
}

/**
 * Discovers active bridge endpoint by testing candidate URLs.
 */
export async function checkBridgeHealth(): Promise<CrocBridgeStatus> {
  const custom = getCustomBridgeUrl();
  const candidates = [
    custom,
    '/api/croc',
    'http://localhost:3001/api/croc',
    'http://127.0.0.1:3001/api/croc',
  ].filter(Boolean) as string[];

  for (const baseUrl of candidates) {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${cleanBase}/status`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        return {
          ok: true,
          service: json.service || 'art-street-croc-bridge',
          version: json.version || '1.0.0',
          activeUrl: cleanBase,
        };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return {
    ok: false,
    error: 'No se pudo conectar con el puente de GetCroc. Asegúrate de ejecutar `pnpm run bridge` en tu terminal.',
  };
}

/**
 * Export data through GetCroc CLI bridge.
 */
export async function exportViaGetCroc(data: AppStateData): Promise<CrocExportResult> {
  const health = await checkBridgeHealth();
  if (!health.ok || !health.activeUrl) {
    throw new Error(health.error || 'Puente GetCroc no disponible');
  }

  const res = await fetch(`${health.activeUrl}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data,
      downloads: 1, // Single-use transfer as requested
      expiration: '1d',
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.details || 'Error al exportar datos vía GetCroc');
  }

  return {
    success: true,
    browserUrl: json.browserUrl || '',
    token: json.token || '',
    code: json.code || json.token || json.browserUrl || '',
    expires: json.expires || '1 descarga o 24 horas',
  };
}

/**
 * Import and decode data through GetCroc CLI bridge in real-time.
 */
export async function importViaGetCroc(codeOrUrl: string): Promise<CrocImportResult> {
  const health = await checkBridgeHealth();
  if (!health.ok || !health.activeUrl) {
    throw new Error(health.error || 'Puente GetCroc no disponible');
  }

  const normalized = normalizeCrocInput(codeOrUrl);
  if (normalized.type === 'unknown' || !normalized.cleaned) {
    throw new Error('Por favor ingresa un código o enlace de GetCroc válido');
  }

  const res = await fetch(`${health.activeUrl}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: normalized.cleaned,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || json.details || 'No se pudo importar el archivo desde GetCroc');
  }

  return {
    success: true,
    data: json.data as AppStateData,
    filename: json.filename,
  };
}
