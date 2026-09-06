import { AppStateData } from '../types/curriculum';

export interface UniversalSyncResult {
  code: string;
  url: string;
  sizeBytes: number;
}

export interface SyncImportResult {
  success: boolean;
  data?: AppStateData;
  filename?: string;
  error?: string;
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

  // If full URL with ?sync= or ?code= or ?import=
  const urlSyncMatch = cleaned.match(/[?&](?:sync|import|code)=([^&#]+)/);
  if (urlSyncMatch) {
    cleaned = decodeURIComponent(urlSyncMatch[1]);
  }

  if (!cleaned.startsWith('ART-SYNC-v1.') && !cleaned.startsWith('art-sync-v1.')) {
    throw new Error('El formato no corresponde a un código de sincronización válido');
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
  } catch {
    throw new Error('No se pudo decodificar el paquete de sincronización');
  }
}

/**
 * Normalizes input: detects proprietary ART-SYNC codes or sync URLs.
 */
export function normalizeSyncInput(input: string): {
  type: 'universal_code' | 'unknown';
  cleaned: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'unknown', cleaned: '' };
  }

  if (
    trimmed.startsWith('ART-SYNC-v1.') ||
    trimmed.startsWith('art-sync-v1.') ||
    trimmed.includes('sync=ART-SYNC') ||
    trimmed.includes('sync=art-sync')
  ) {
    return {
      type: 'universal_code',
      cleaned: trimmed,
    };
  }

  return { type: 'unknown', cleaned: trimmed };
}

/**
 * Unified import for proprietary sync codes / links. No server required.
 */
export async function importViaSyncCode(codeOrUrl: string): Promise<SyncImportResult> {
  const normalized = normalizeSyncInput(codeOrUrl);
  if (normalized.type === 'unknown' || !normalized.cleaned) {
    throw new Error('Por favor ingresa un código o enlace de sincronización válido (ART-SYNC-v1...)');
  }

  const data = await decodeUniversalSyncCode(normalized.cleaned);
  return {
    success: true,
    data,
    filename: 'universal_sync.json',
  };
}
