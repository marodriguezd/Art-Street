import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Cloud, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  FileJson, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AppStateData } from '../types/curriculum';
import { exportAllData, importAllData } from '../services/storage';
import { 
  checkBridgeHealth, 
  exportViaGetCroc, 
  importViaGetCroc, 
  normalizeCrocInput, 
  getCustomBridgeUrl, 
  setCustomBridgeUrl,
  CrocBridgeStatus,
  CrocExportResult
} from '../services/crocService';
import confetti from 'canvas-confetti';
import { playCelebrationFanfare } from '../utils/audio';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  initialTab?: 'import' | 'export';
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  initialTab = 'import',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [bridgeStatus, setBridgeStatus] = useState<CrocBridgeStatus>({ ok: false });
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [customBridge, setCustomBridge] = useState(getCustomBridgeUrl() || '');
  const [showBridgeSettings, setShowBridgeSettings] = useState(false);

  // Import states
  const [crocInput, setCrocInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<CrocExportResult | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'code' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      refreshBridge();
    }
  }, [isOpen, initialTab]);

  const refreshBridge = async () => {
    setIsCheckingBridge(true);
    try {
      const status = await checkBridgeHealth();
      setBridgeStatus(status);
    } finally {
      setIsCheckingBridge(false);
    }
  };

  const handleSaveCustomBridge = async () => {
    setCustomBridgeUrl(customBridge);
    await refreshBridge();
    setShowBridgeSettings(false);
  };

  // Local JSON Export
  const handleExportLocalJson = async () => {
    try {
      const data = await exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `art_street_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting local JSON:', err);
      alert('Error exportando archivo JSON');
    }
  };

  // Local JSON Import
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: AppStateData = JSON.parse(text);

        if (!parsed.profile && !parsed.checks && !parsed.milestones) {
          throw new Error('El archivo no contiene un formato de respaldo válido de Art Street');
        }

        await importAllData(parsed);
        playCelebrationFanfare();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        setImportStatusMessage('¡Respaldo JSON importado exitosamente!');
        setTimeout(() => {
          onDataRestored();
          onClose();
        }, 1200);
      } catch (err: any) {
        console.error('Error importing local JSON file:', err);
        setImportError(err.message || 'Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  // GetCroc Cloud Export (One-time transfer)
  const handleExportViaCroc = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);

    try {
      const data = await exportAllData();
      const result = await exportViaGetCroc(data);
      setExportResult(result);
    } catch (err: any) {
      console.error('Error exporting via GetCroc:', err);
      setExportError(err.message || 'Error al conectar con GetCroc para exportar');
    } finally {
      setIsExporting(false);
    }
  };

  // GetCroc Cloud Import
  const handleImportViaCroc = async () => {
    if (!crocInput.trim()) {
      setImportError('Por favor introduce un enlace o código de GetCroc');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportStatusMessage('Conectando con GetCroc y descargando transferencia...');

    try {
      const res = await importViaGetCroc(crocInput);
      if (!res.data) {
        throw new Error('No se recibieron datos de respaldo');
      }

      setImportStatusMessage('Verificando y aplicando datos a la base local...');
      await importAllData(res.data);

      playCelebrationFanfare();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setImportStatusMessage(`¡Éxito! Progreso de "${res.data.profile?.name || 'Artista'}" restaurado.`);
      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('Error importing via GetCroc:', err);
      setImportError(err.message || 'Error al descargar o aplicar datos desde GetCroc');
      setImportStatusMessage(null);
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string, field: 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const detectedInputType = normalizeCrocInput(crocInput);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#111c30] border border-white/[0.1] w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-4 sm:p-7 shadow-2xl relative my-auto sm:my-8 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fantasy-sky via-fantasy-pink to-fantasy-ochre p-[1px] flex-shrink-0">
              <div className="w-full h-full bg-[#0d1422] rounded-[15px] flex items-center justify-center text-fantasy-sky">
                <Cloud className="w-5 h-5" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight truncate">
                  Sincronización y Respaldo
                </h3>
                <span className="font-mono text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-fantasy-pink/15 text-fantasy-pink border border-fantasy-pink/30">
                  GETCROC + JSON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans truncate">
                Portabilidad universal entre PC, tablet y móvil con un solo código
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-[#0b1320] p-1.5 rounded-2xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORTAR DATOS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORTAR DATOS</span>
          </button>
        </div>

        {/* Feedback banners */}
        {importStatusMessage && (
          <div className="mb-4 p-3 bg-fantasy-lime/15 border border-fantasy-lime/30 rounded-2xl text-xs text-fantasy-lime font-display font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 animate-spin" />
            <span>{importStatusMessage}</span>
          </div>
        )}

        {(importError || exportError) && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-300 font-sans flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{importError || exportError}</span>
          </div>
        )}

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Primary: GetCroc Import */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fantasy-sky flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-fantasy-sky" />
                  MÉTODO 1: IMPORTAR CON CÓDIGO GETCROC
                </span>
                {detectedInputType.type !== 'unknown' && (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-fantasy-sky/15 text-fantasy-sky border border-fantasy-sky/30 uppercase">
                    {detectedInputType.type === 'store_url' ? '🔗 URL Detectada' : '🔑 Token Detectado'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Pega el enlace o código que generó otra persona o tu otro dispositivo. Se descargará y aplicará el currículum en tiempo real.
              </p>

              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={crocInput}
                    onChange={(e) => setCrocInput(e.target.value)}
                    placeholder="ej. https://getcroc.com/s/xyz... o código croc-store..."
                    className="w-full bg-[#080d16] border border-white/[0.1] rounded-xl px-3.5 py-3 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fantasy-sky transition-colors"
                  />
                  {crocInput && (
                    <button
                      type="button"
                      onClick={() => setCrocInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isImporting || !crocInput.trim()}
                  onClick={handleImportViaCroc}
                  className="w-full bg-gradient-to-r from-fantasy-sky to-fantasy-pink hover:opacity-95 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md shadow-fantasy-sky/20 flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                  <span>{isImporting ? 'Descargando desde GetCroc...' : 'Decodificar e Importar en Tiempo Real'}</span>
                </button>
              </div>
            </div>

            {/* Secondary: Local JSON File Import */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <FileJson className="w-3.5 h-3.5 text-fantasy-ochre" />
                MÉTODO 2: ARCHIVO JSON LOCAL
              </span>
              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Selecciona un archivo <code>.json</code> exportado previamente desde tu almacenamiento local.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] hover:border-fantasy-ochre rounded-xl p-3.5 text-center cursor-pointer transition-all bg-[#080d16] hover:bg-[#0d1524] flex items-center justify-center gap-2.5 group"
              >
                <Upload className="w-4 h-4 text-fantasy-ochre group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Cargar Archivo de Respaldo (.json)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleLocalFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Primary: GetCroc Cloud Export */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fantasy-sky flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-fantasy-sky" />
                MÉTODO 1: EXPORTAR A LA NUBE VÍA GETCROC (1 SOLO USO)
              </span>
              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Crea un paquete cifrado en GetCroc para transferir tu progreso a otro dispositivo. Se genera una URL y código de un solo uso.
              </p>

              {!exportResult ? (
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportViaCroc}
                  className="w-full bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-ochre hover:opacity-95 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-fantasy-sky/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Cloud className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                  <span>{isExporting ? 'Generando Paquete GetCroc...' : 'Subir a GetCroc y Obtener Código'}</span>
                </button>
              ) : (
                <div className="mt-3 p-3.5 rounded-xl bg-[#080d16] border border-fantasy-sky/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-fantasy-lime flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      TRANSFERENCIA LISTA // 1 USO
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      {exportResult.expires}
                    </span>
                  </div>

                  {/* Browser URL copy */}
                  {exportResult.browserUrl && (
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">
                        Enlace para el Navegador:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={exportResult.browserUrl}
                          className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-xs text-fantasy-sky select-all truncate"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(exportResult.browserUrl, 'url')}
                          className="px-3 py-1.5 rounded-lg bg-fantasy-sky/20 hover:bg-fantasy-sky/30 border border-fantasy-sky/40 text-fantasy-sky font-mono text-xs font-bold uppercase flex items-center gap-1 transition-colors flex-shrink-0"
                        >
                          {copiedField === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'url' ? 'Copiado' : 'Copiar URL'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Token copy */}
                  {exportResult.token && (
                    <div>
                      <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">
                        Token Directo para CLI o App:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={exportResult.token}
                          className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-xs text-fantasy-pink select-all truncate"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(exportResult.token, 'code')}
                          className="px-3 py-1.5 rounded-lg bg-fantasy-pink/20 hover:bg-fantasy-pink/30 border border-fantasy-pink/40 text-fantasy-pink font-mono text-xs font-bold uppercase flex items-center gap-1 transition-colors flex-shrink-0"
                        >
                          {copiedField === 'code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'code' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-sans leading-tight pt-1">
                    💡 Copia la URL o el código y pégalo en tu otro dispositivo en la sección <strong>Importar con Código GetCroc</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Secondary: Local JSON Export */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <FileJson className="w-3.5 h-3.5 text-fantasy-ochre" />
                MÉTODO 2: DESCARGAR ARCHIVO JSON LOCAL
              </span>
              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Descarga una copia completa de tu perfil, pruebas fotográficas y checks directamente a tu carpeta de descargas.
              </p>

              <button
                type="button"
                onClick={handleExportLocalJson}
                className="w-full bg-[#080d16] hover:bg-[#0e1626] border border-white/[0.1] hover:border-fantasy-ochre text-white font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-fantasy-ochre" />
                <span>Descargar Archivo JSON en Dispositivo</span>
              </button>
            </div>
          </div>
        )}

        {/* Bridge Status Indicator & Help */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                bridgeStatus.ok ? 'bg-fantasy-lime animate-pulse' : 'bg-fantasy-ochre'
              }`}
            />
            <span className="text-slate-300">
              PUENTE GETCROC:{' '}
              <strong className={bridgeStatus.ok ? 'text-fantasy-lime' : 'text-fantasy-ochre'}>
                {bridgeStatus.ok ? 'CONECTADO' : 'OFFLINE / LOCAL'}
              </strong>
            </span>
            {bridgeStatus.activeUrl && (
              <span className="text-slate-500 hidden sm:inline truncate max-w-[150px]">
                ({bridgeStatus.activeUrl})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <button
              type="button"
              onClick={refreshBridge}
              disabled={isCheckingBridge}
              className="text-slate-400 hover:text-white underline transition-colors disabled:opacity-50"
              title="Comprobar conexión"
            >
              {isCheckingBridge ? '[Verificando...]' : '[Reintentar]'}
            </button>
            <button
              type="button"
              onClick={() => setShowBridgeSettings(!showBridgeSettings)}
              className="text-fantasy-sky hover:text-white underline transition-colors"
            >
              [Configurar]
            </button>
          </div>
        </div>

        {/* Expandable Bridge Configuration / CLI instructions */}
        {showBridgeSettings && (
          <div className="mt-3 p-3 bg-[#080d16] rounded-xl border border-white/[0.08] text-xs space-y-2">
            <p className="text-[11px] text-slate-300 font-sans">
              Para habilitar la transferencia GetCroc en tu terminal Termux o servidor local, ejecuta:
            </p>
            <div className="p-2 bg-black/60 rounded-lg font-mono text-[11px] text-fantasy-sky flex items-center justify-between gap-2">
              <code>pnpm run bridge</code>
              <button
                type="button"
                onClick={() => copyToClipboard('pnpm run bridge', 'code')}
                className="text-slate-400 hover:text-white"
                title="Copiar comando"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2">
              <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">
                URL personalizada del puente (ej. para red local):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customBridge}
                  onChange={(e) => setCustomBridge(e.target.value)}
                  placeholder="http://localhost:3001/api/croc"
                  className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:border-fantasy-sky"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomBridge}
                  className="px-3 py-1.5 bg-fantasy-sky/20 border border-fantasy-sky/40 text-fantasy-sky font-mono text-xs rounded-lg font-bold"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
