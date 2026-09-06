import React, { useState, useRef } from 'react';
import { X, Cloud, Zap, FileCode, Upload, Download, Check, AlertCircle, Copy, Sparkles } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string) => boolean;
  onExport: () => string;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  
  // Import states
  const [importCode, setImportCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export states
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handle Decode & Import from Code / Link
  const handleImportFromCode = () => {
    if (!importCode.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor, pega un código ART-SYNC o enlace de sincronización.' });
      return;
    }

    try {
      let rawData = importCode.trim();

      // Extract ?sync= parameter if full URL is pasted
      if (rawData.includes('?sync=')) {
        const urlParams = new URLSearchParams(rawData.split('?')[1]);
        const syncVal = urlParams.get('sync');
        if (syncVal) rawData = decodeURIComponent(syncVal);
      } else if (rawData.startsWith('ART-SYNC-')) {
        const base64Str = rawData.replace('ART-SYNC-', '');
        rawData = atob(base64Str);
      }

      const success = onImport(rawData);
      if (success) {
        setStatusMessage({ type: 'success', text: '¡Progreso importado con éxito!' });
        setImportCode('');
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: 'Formato de código o enlace no válido.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al decodificar los datos. Comprueba el formato.' });
    }
  };

  // Handle Import from File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = onImport(content);
        if (success) {
          setStatusMessage({ type: 'success', text: '¡Archivo JSON importado con éxito!' });
          setTimeout(() => {
            setStatusMessage(null);
            onClose();
          }, 1200);
        } else {
          setStatusMessage({ type: 'error', text: 'Formato del archivo JSON no válido.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Error al leer el archivo JSON.' });
      }
    };
    reader.readAsText(file);
  };

  // Handle Export: Generate Link & Code
  const handleGenerateExportCode = () => {
    try {
      const jsonString = onExport();
      const base64Code = `ART-SYNC-${btoa(jsonString)}`;
      setGeneratedCode(base64Code);
      setCopied(false);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al generar el código de exportación.' });
    }
  };

  // Handle Copy to Clipboard
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Handle Export: Download File
  const handleDownloadJSON = () => {
    try {
      const jsonString = onExport();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `art-street-respaldo-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al descargar la copia JSON.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/60 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700/60 text-pink-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Sincronización y Respaldo</h2>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider text-pink-400 uppercase rounded-full bg-pink-500/10 border border-pink-500/20">
                  PORTABILIDAD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Transfiere tu currículum entre PC, tablet y móvil sin perder datos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'import'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              IMPORTAR DATOS
            </button>
            <button
              onClick={() => { setActiveTab('export'); setStatusMessage(null); }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'export'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              EXPORTAR DATOS
            </button>
          </div>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className={statusMessage.type === 'success' ? 'text-emerald-300' : 'text-rose-300'}>
              {statusMessage.text}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: IMPORTAR */}
          {activeTab === 'import' && (
            <>
              {/* Method 1: Paste Link or Code */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Método 1: Pegar Enlace o Código</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pega el código o enlace directo de sincronización generado por otro dispositivo o navegador.
                </p>

                <input
                  type="text"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Pega enlace ?sync=... o código ART-SYNC-..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 text-xs font-mono transition-all"
                />

                <button
                  onClick={handleImportFromCode}
                  className="w-full py-3 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Decodificar e importar en tiempo real
                </button>
              </div>

              {/* Method 2: Local JSON File */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Método 2: Archivo JSON Local</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecciona un archivo .json exportado previamente desde tu almacenamiento local.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl bg-slate-900/50 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-slate-900"
                >
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Examinar o soltar archivo .json de respaldo
                </button>
              </div>
            </>
          )}

          {/* TAB 2: EXPORTAR */}
          {activeTab === 'export' && (
            <>
              {/* Method 1: Code and Quick Link */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-pink-400 uppercase">
                    <Zap className="w-4 h-4 text-pink-400" />
                    <span>Método 1: Código y Enlace Rápido (Recomendado)</span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    100% NAVEGADOR
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Genera un código portable al instante. Puedes copiarlo o enviarlo a tu otro dispositivo para sincronizar en 1 clic.
                </p>

                {!generatedCode ? (
                  <button
                    onClick={handleGenerateExportCode}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    GENERAR ENLACE Y CÓDIGO DE SINCRONIZACIÓN
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-pink-500/30 text-xs font-mono text-pink-300 break-all max-h-24 overflow-y-auto">
                      {generatedCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="w-full py-2.5 px-4 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? '¡CÓDIGO COPIADO AL PORTAPAPELES!' : 'COPIAR CÓDIGO AL PORTAPAPELES'}
                    </button>
                  </div>
                )}
              </div>

              {/* Method 2: Download Local JSON */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400 uppercase">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Método 2: Descargar Archivo JSON Local</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Descarga una copia completa de tu perfil y checks directamente a tu almacenamiento local.
                </p>

                <button
                  onClick={handleDownloadJSON}
                  className="w-full py-3 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  DESCARGAR ARCHIVO JSON EN DISPOSITIVO
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
