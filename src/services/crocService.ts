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

export interface UniversalSyncResult {
  code: string;
  url: string;
  sizeBytes: number;
}

/**
 * Compresses AppStateData into an ultra-compact base64url string with prefix ART-SYNC-v1.
 * Works 100% in-browser on mobile, tablet, and PC without any server or terminal requirement.
 */
export async function generateUniversalSyncCode(data: AppStateData): Promise<UniversalSyncResult> {
  const json = JSON.stringify(data);
  let encodedPayload = '';

  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate'));
      const buffer = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      encodedPayload = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch {
      encodedPayload = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } else {
    encodedPayload = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const code = `ART-SYNC-v1.${encodedPayload}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const url = `${origin}${pathname}?sync=${encodeURIComponent(code)}`;

  return {
    code,
    url,
    sizeBytes: json.length,
  };
}

/**
 * Decodes an ART-SYNC-v1... code or ?sync=... URL into AppStateData.
 */
export async function decodeUniversalSyncCode(input: string): Promise<AppStateData> {
  let cleaned = input.trim();

  // If full URL with ?sync= or ?code=
  const urlSyncMatch = cleaned.match(/[?&](?:sync|import|code)=([^&#]+)/);
  if (urlSyncMatch) {
    cleaned = decodeURIComponent(urlSyncMatch[1]);
  }

  if (!cleaned.startsWith('ART-SYNC-v1.') && !cleaned.startsWith('art-sync-v1.')) {
    throw new Error('El formato no corresponde a un código de sincronización universal');
  }

  const payload = cleaned.replace(/^art-sync-v1\./i, '');
  let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      const text = await new Response(stream).text();
      return JSON.parse(text) as AppStateData;
    } catch {
      // Fallback
    }
  }

  try {
    const text = decodeURIComponent(escape(binary));
    return JSON.parse(text) as AppStateData;
  } catch (e) {
    throw new Error('No se pudo decodificar el paquete de sincronización universal');
  }
}

/**
 * Normalizes input: handles Universal sync codes, full GetCroc URLs, store tokens, or simple relay code phrases.
 */
export function normalizeCrocInput(input: string): {
  type: 'universal_code' | 'store_url' | 'store_token' | 'relay_code' | 'unknown';
  cleaned: string;
  tokenEquivalent?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'unknown', cleaned: '' };
  }

  // Case 0: Universal Sync Code or Sync URL (e.g. ART-SYNC-v1... or ?sync=ART-SYNC-v1...)
  if (
    trimmed.startsWith('ART-SYNC-v1.') || 
    trimmed.startsWith('art-sync-v1.') || 
    trimmed.includes('sync=ART-SYNC') ||
    trimmed.includes('sync=art-sync')
  ) {
    return {
      type: 'universal_code',
      cleaned: trimmed,
      tokenEquivalent: trimmed,
    };
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
    error: 'Puente GetCroc offline (modo terminal local no detectado)',
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

export async function importViaGetCroc(codeOrUrl: string): Promise<CrocImportResult> {
  const normalized = normalizeCrocInput(codeOrUrl);
  if (normalized.type === 'unknown' || !normalized.cleaned) {
    throw new Error('Por favor ingresa un código o enlace válido');
  }

  // Fast path: Universal in-browser code requires NO bridge or backend!
  if (normalized.type === 'universal_code') {
    const data = await decodeUniversalSyncCode(normalized.cleaned);
    return {
      success: true,
      data,
      filename: 'universal_sync.json',
    };
  }

  const health = await checkBridgeHealth();
  if (!health.ok || !health.activeUrl) {
    throw new Error(
      `El código "${codeOrUrl.trim()}" es una transferencia de GetCroc.com. Para importarlo en la web sin el puente de terminal activo, puedes descargar el archivo JSON directamente desde getcroc.com e importarlo aquí como Archivo JSON.`
    );
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
