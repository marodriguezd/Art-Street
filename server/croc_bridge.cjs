/**
 * Art Street — GetCroc Backend Bridge Server
 * Provides REST API endpoints for seamless one-time stored transfers via GetCroc CLI.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;
const TMP_DIR = process.env.TMPDIR || os.tmpdir();

function parseCrocInput(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();

  // Case 1: Browser Link format https://getcroc.com/s/<ID>#v1.<KEY>
  const storeUrlMatch = trimmed.match(/^https?:\/\/([^/]+)\/s\/([a-zA-Z0-9_-]+)#v1\.([a-zA-Z0-9_-]+)$/);
  if (storeUrlMatch) {
    const origin = `https://${storeUrlMatch[1]}`;
    const originB64 = Buffer.from(origin).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const id = storeUrlMatch[2];
    const key = storeUrlMatch[3];
    return `croc-store-v1.${originB64}.${id}.${key}`;
  }

  // Case 2: Query param URL format https://getcroc.com/?code=<CODE>
  const queryMatch = trimmed.match(/[?&]code=([a-zA-Z0-9_-]+)/);
  if (queryMatch) {
    return queryMatch[1];
  }

  // Case 3: Token or raw relay code phrase
  return trimmed;
}

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(json);
}

function handleExport(body, res) {
  try {
    const { data, downloads = 1, expiration = '1d' } = body;
    if (!data || typeof data !== 'object') {
      return sendJson(res, 400, { error: 'Datos de respaldo inválidos o vacíos' });
    }

    const tempFileId = `art_street_backup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.json`;
    const tempFilePath = path.join(TMP_DIR, tempFileId);

    fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), 'utf8');

    const args = [
      'send',
      '--store',
      '--store-downloads',
      String(downloads),
      '--store-expiration',
      String(expiration),
      tempFilePath,
    ];

    const child = spawn('croc', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
    }, 45000);

    child.on('close', (code) => {
      clearTimeout(timeout);

      // Clean up temp file
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }

      const combinedOutput = stdout + '\n' + stderr;

      if (code !== 0) {
        console.error('croc send error:', code, combinedOutput);
        return sendJson(res, 500, {
          error: 'Error al ejecutar croc send en el servidor',
          details: combinedOutput,
        });
      }

      // Extract browser link and CLI recipient token
      const linkMatch = combinedOutput.match(/https:\/\/getcroc\.com\/s\/[a-zA-Z0-9_-]+#v1\.[a-zA-Z0-9_-]+/);
      const tokenMatch = combinedOutput.match(/croc-store-v1\.[a-zA-Z0-9_.-]+/);

      if (!linkMatch && !tokenMatch) {
        return sendJson(res, 500, {
          error: 'No se pudo obtener el enlace de transferencia de GetCroc',
          output: combinedOutput,
        });
      }

      const browserUrl = linkMatch ? linkMatch[0] : '';
      const token = tokenMatch ? tokenMatch[0] : '';

      return sendJson(res, 200, {
        success: true,
        browserUrl,
        token,
        code: token || browserUrl,
        expires: '1 descarga verificada o 24 horas',
      });
    });
  } catch (err) {
    console.error('handleExport exception:', err);
    return sendJson(res, 500, { error: err.message });
  }
}

function handleImport(body, res) {
  try {
    const { input } = body;
    if (!input) {
      return sendJson(res, 400, { error: 'Se requiere código o URL de GetCroc' });
    }

    const parsedCode = parseCrocInput(input);
    if (!parsedCode) {
      return sendJson(res, 400, { error: 'Código o URL de GetCroc no válido' });
    }

    const tempDirName = `art_street_import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tempDirPath = path.join(TMP_DIR, tempDirName);
    fs.mkdirSync(tempDirPath, { recursive: true });

    const args = ['--overwrite', '--yes', parsedCode];

    const child = spawn('croc', args, {
      cwd: tempDirPath,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
    }, 50000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      const combinedOutput = stdout + '\n' + stderr;

      const cleanup = () => {
        try {
          fs.rmSync(tempDirPath, { recursive: true, force: true });
        } catch (e) {
          console.error('Error cleaning up import temp dir:', e);
        }
      };

      if (code !== 0) {
        cleanup();
        console.error('croc receive error:', code, combinedOutput);
        return sendJson(res, 400, {
          error: 'No se pudo descargar el archivo desde GetCroc. Es posible que el código haya expirado o ya haya sido descargado.',
          details: combinedOutput,
        });
      }

      try {
        const files = fs.readdirSync(tempDirPath);
        const jsonFile = files.find((f) => f.endsWith('.json')) || files[0];

        if (!jsonFile) {
          cleanup();
          return sendJson(res, 400, {
            error: 'No se encontró ningún archivo descargado en la transferencia de GetCroc',
          });
        }

        const filePath = path.join(tempDirPath, jsonFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileContent);

        cleanup();

        if (!parsedData || typeof parsedData !== 'object') {
          return sendJson(res, 400, {
            error: 'El archivo descargado no corresponde a un formato de datos válido de Art Street',
          });
        }

        return sendJson(res, 200, {
          success: true,
          data: parsedData,
          filename: jsonFile,
        });
      } catch (parseErr) {
        cleanup();
        console.error('JSON parse error from croc download:', parseErr);
        return sendJson(res, 400, {
          error: 'El archivo descargado no contiene un formato JSON válido',
          details: parseErr.message,
        });
      }
    });
  } catch (err) {
    console.error('handleImport exception:', err);
    return sendJson(res, 500, { error: err.message });
  }
}

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (parsedUrl.pathname === '/api/croc/status' || parsedUrl.pathname === '/status')) {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'art-street-croc-bridge',
      version: '1.0.0',
      tmpDir: TMP_DIR,
      crocBinary: 'croc',
    });
  }

  if (req.method === 'POST' && (parsedUrl.pathname === '/api/croc/export' || parsedUrl.pathname === '/export')) {
    let bodyStr = '';
    req.on('data', (chunk) => {
      bodyStr += chunk;
      if (bodyStr.length > 25 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        handleExport(body, res);
      } catch (e) {
        return sendJson(res, 400, { error: 'Cuerpo de solicitud JSON inválido' });
      }
    });
    return;
  }

  if (req.method === 'POST' && (parsedUrl.pathname === '/api/croc/import' || parsedUrl.pathname === '/import')) {
    let bodyStr = '';
    req.on('data', (chunk) => {
      bodyStr += chunk;
      if (bodyStr.length > 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        handleImport(body, res);
      } catch (e) {
        return sendJson(res, 400, { error: 'Cuerpo de solicitud JSON inválido' });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'Ruta no encontrada', path: parsedUrl.pathname });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Art Street GetCroc Bridge] Activo y escuchando en http://0.0.0.0:${PORT}`);
  });
}

module.exports = { server, parseCrocInput, handleExport, handleImport };
