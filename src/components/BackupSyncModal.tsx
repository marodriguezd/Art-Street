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
  Zap,
  Share2,
  ExternalLink
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
  generateUniversalSyncCode,
  UniversalSyncResult,
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
  initialCode?: string;
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  initialTab = 'import',
  initialCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
  const [bridgeStatus, setBridgeStatus] = useState<CrocBridgeStatus>({ ok: false });
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [customBridge, setCustomBridge] = useState(getCustomBridgeUrl() || '');
  const [showBridgeSettings, setShowBridgeSettings] = useState(false);

  // Import states
  const [crocInput, setCrocInput] = useState(initialCode);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Export states
  const [isExportingUniversal, setIsExportingUniversal] = useState(false);
  const [universalResult, setUniversalResult] = useState<UniversalSyncResult | null>(null);

  const [isExportingCroc, setIsExportingCroc] = useState(false);
  const [crocResult, setCrocResult] = useState<CrocExportResult | null>(null);

  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'code' | 'uni_url' | 'uni_code' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialCode) {
        setCrocInput(initialCode);
      }
      refreshBridge();
    }
  }, [isOpen, initialTab, initialCode]);

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

  // Universal In-Browser Sync Export
  const handleExportUniversal = async () => {
    setIsExportingUniversal(true);
    setExportError(null);
    try {
      const data = await exportAllData();
      const res = await generateUniversalSyncCode(data);
      setUniversalResult(res);
    } catch (err: any) {
      console.error('Error generating universal sync code:', err);
      setExportError(err.message || 'Error al generar el código universal');
    } finally {
      setIsExportingUniversal(false);
    }
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

  // GetCroc Cloud Export (One-time transfer via CLI bridge)
  const handleExportViaCroc = async () => {
    setIsExportingCroc(true);
    setExportError(null);
    setCrocResult(null);

    try {
      const data = await exportAllData();
      const result = await exportViaGetCroc(data);
      setCrocResult(result);
    } catch (err: any) {
      console.error('Error exporting via GetCroc:', err);
      setExportError(err.message || 'Error al exportar vía GetCroc');
    } finally {
      setIsExportingCroc(false);
    }
  };

  // Unified Import (Supports Universal Code, GetCroc URLs, Tokens, or Phrase)
  const handleImport = async () => {
    if (!crocInput.trim()) {
      setImportError('Por favor introduce un enlace o código');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportStatusMessage('Conectando y decodificando transferencia...');

    try {
      const res = await importViaGetCroc(crocInput);
      if (!res.data) {
        throw new Error('No se recibieron datos de respaldo válidos');
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
      console.error('Error importing:', err);
      setImportError(err.message || 'Error al importar datos');
      setImportStatusMessage(null);
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string, field: 'url' | 'code' | 'uni_url' | 'uni_code') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleNativeShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Art Street — Respaldo de Progreso',
          text: 'Mi currículum y progreso artístico en Art Street:',
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard(url, 'uni_url');
    }
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
                  PORTABILIDAD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans truncate">
                Transfiere tu currículum entre PC, tablet y móvil sin perder datos
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
            <span className="leading-relaxed">{importError || exportError}</span>
          </div>
        )}

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Primary: Universal or GetCroc Input */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fantasy-sky flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-fantasy-sky" />
                  MÉTODO 1: PEGAR ENLACE O CÓDIGO
                </span>
                {detectedInputType.type !== 'unknown' && (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-fantasy-sky/15 text-fantasy-sky border border-fantasy-sky/30 uppercase">
                    {detectedInputType.type === 'universal_code' && '⚡ Código Universal'}
                    {detectedInputType.type === 'store_url' && '🔗 URL GetCroc'}
                    {detectedInputType.type === 'store_token' && '🔑 Token GetCroc'}
                    {detectedInputType.type === 'relay_code' && '📡 Frase GetCroc'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Pega el código o enlace directo de sincronización generado por otro dispositivo o navegador. Se decodifica e importa en tiempo real.
              </p>

              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={crocInput}
                    onChange={(e) => setCrocInput(e.target.value)}
                    placeholder="Pega enlace ?sync=..., código ART-SYNC-..., o enlace getcroc.com..."
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
                  onClick={handleImport}
                  className="w-full bg-gradient-to-r from-fantasy-sky to-fantasy-pink hover:opacity-95 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-md shadow-fantasy-sky/20 flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                  <span>{isImporting ? 'Procesando e Importando...' : 'Decodificar e Importar en Tiempo Real'}</span>
                </button>
              </div>

              {detectedInputType.type === 'relay_code' && !bridgeStatus.ok && (
                <div className="mt-3 p-2.5 bg-fantasy-ochre/10 border border-fantasy-ochre/30 rounded-xl text-[11px] text-fantasy-ochre font-sans flex items-center justify-between gap-2">
                  <span>Código de GetCroc detectado. Puedes abrirlo directamente para descargar el JSON:</span>
                  <a
                    href={`https://getcroc.com/?code=${encodeURIComponent(detectedInputType.cleaned)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-white flex items-center gap-1 flex-shrink-0"
                  >
                    Abrir en GetCroc <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Secondary: Local JSON File Import */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <FileJson className="w-3.5 h-3.5 text-fantasy-ochre" />
                MÉTODO 2: ARCHIVO JSON LOCAL
              </span>
              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Selecciona un archivo <code>.json</code> exportado previamente desde tu almacenamiento local o descargado de GetCroc.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] hover:border-fantasy-ochre rounded-xl p-3.5 text-center cursor-pointer transition-all bg-[#080d16] hover:bg-[#0d1524] flex items-center justify-center gap-2.5 group"
              >
                <FileJson className="w-5 h-5 text-slate-400 group-hover:text-fantasy-ochre transition-colors" />
                <span className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors">
                  Examinar o soltar archivo .json de respaldo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleLocalFileChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {/* Primary: Universal In-Browser Sync (Zero-Server / Mobile Friendly) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-fantasy-sky flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-fantasy-sky" />
                  MÉTODO 1: CÓDIGO Y ENLACE RÁPIDO (RECOMENDADO)
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-fantasy-lime/15 text-fantasy-lime border border-fantasy-lime/30 uppercase">
                  ⚡ 100% NAVEGADOR // SIN SERVIDOR
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Genera un enlace y código portable al instante. Puedes copiarlo o enviarlo por WhatsApp / Telegram a tu otro dispositivo para sincronizar tu progreso en 1 clic.
              </p>

              {!universalResult ? (
                <button
                  type="button"
                  disabled={isExportingUniversal}
                  onClick={handleExportUniversal}
                  className="w-full bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-ochre hover:opacity-95 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg shadow-fantasy-sky/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className={`w-4 h-4 ${isExportingUniversal ? 'animate-spin' : ''}`} />
                  <span>{isExportingUniversal ? 'Generando Código...' : 'Generar Enlace y Código de Sincronización'}</span>
                </button>
              ) : (
                <div className="mt-3 p-3.5 rounded-xl bg-[#080d16] border border-fantasy-sky/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-fantasy-lime flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      CÓDIGO DE SINCRONIZACIÓN LISTO
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      {Math.round(universalResult.sizeBytes / 1024 * 10) / 10} KB
                    </span>
                  </div>

                  {/* Direct 1-Click Sync URL */}
                  <div>
                    <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">
                      Enlace Directo para Abrir en Otro Dispositivo:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={universalResult.url}
                        className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-xs text-fantasy-sky select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(universalResult.url, 'uni_url')}
                        className="px-3 py-1.5 rounded-lg bg-fantasy-sky/20 hover:bg-fantasy-sky/30 border border-fantasy-sky/40 text-fantasy-sky font-mono text-xs font-bold uppercase flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        {copiedField === 'uni_url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'uni_url' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNativeShare(universalResult.url)}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] transition-colors flex-shrink-0"
                        title="Compartir"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Compact Text Code */}
                  <div>
                    <label className="block font-mono text-[9px] uppercase text-slate-400 mb-1">
                      O Código Compacto para Pegar:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={universalResult.code}
                        className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2.5 py-1.5 font-mono text-xs text-fantasy-pink select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(universalResult.code, 'uni_code')}
                        className="px-3 py-1.5 rounded-lg bg-fantasy-pink/20 hover:bg-fantasy-pink/30 border border-fantasy-pink/40 text-fantasy-pink font-mono text-xs font-bold uppercase flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        {copiedField === 'uni_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'uni_code' ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-tight pt-1">
                    💡 Pega el enlace en cualquier navegador de tu otro dispositivo para restaurar tu currículum sin instalar nada.
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
                Descarga una copia completa de tu perfil y checks directamente a tu almacenamiento local.
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

            {/* Tertiary: GetCroc CLI Bridge (Optional) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1320] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-fantasy-sky" />
                  MÉTODO 3: NUBE GETCROC (PUENTE CLI)
                </span>
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border uppercase ${
                  bridgeStatus.ok ? 'bg-fantasy-lime/15 text-fantasy-lime border-fantasy-lime/30' : 'bg-slate-800 text-slate-400 border-white/[0.08]'
                }`}>
                  {bridgeStatus.ok ? '● Puente Conectado' : '○ Modo Terminal Offline'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 font-sans leading-relaxed">
                Utiliza la herramienta CLI <code>croc</code> para transferencias temporales de un solo uso en red local o servidor.
              </p>

              {bridgeStatus.ok ? (
                !crocResult ? (
                  <button
                    type="button"
                    disabled={isExportingCroc}
                    onClick={handleExportViaCroc}
                    className="w-full bg-[#080d16] hover:bg-[#0e1626] border border-fantasy-sky/40 text-fantasy-sky font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Cloud className={`w-4 h-4 ${isExportingCroc ? 'animate-spin' : ''}`} />
                    <span>{isExportingCroc ? 'Subiendo a GetCroc...' : 'Subir a GetCroc y Obtener Enlace'}</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#080d16] border border-fantasy-sky/30 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-fantasy-lime font-bold">
                      <span>TRANSFERENCIA GETCROC LISTA</span>
                      <span>{crocResult.expires}</span>
                    </div>
                    {crocResult.browserUrl && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={crocResult.browserUrl}
                          className="flex-1 bg-[#040810] border border-white/[0.08] rounded-lg px-2 py-1 font-mono text-xs text-fantasy-sky truncate"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(crocResult.browserUrl, 'url')}
                          className="px-2.5 py-1 bg-fantasy-sky/20 text-fantasy-sky font-mono text-xs rounded-lg font-bold"
                        >
                          {copiedField === 'url' ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/[0.06] text-[11px] text-slate-400 font-sans flex items-center justify-between gap-2">
                  <span>Puente CLI no detectado en este dispositivo (usa el Método 1 para sincronizar en web/móvil).</span>
                  <button
                    type="button"
                    onClick={() => setShowBridgeSettings(!showBridgeSettings)}
                    className="text-fantasy-sky underline flex-shrink-0 font-mono text-[10px]"
                  >
                    [Configurar]
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bridge Status Indicator & Help */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                bridgeStatus.ok ? 'bg-fantasy-lime animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300">
              PUENTE LOCAL:{' '}
              <strong className={bridgeStatus.ok ? 'text-fantasy-lime' : 'text-slate-400'}>
                {bridgeStatus.ok ? 'ACTIVO' : 'OFFLINE (OPCIONAL)'}
              </strong>
            </span>
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
              [Ajustes]
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
                URL personalizada del puente (ej. para red local o túnel):
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
