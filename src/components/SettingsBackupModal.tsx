import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  Heart, 
  Database, 
  ShieldCheck, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { UserProfile, AppStateData } from '../types/curriculum';
import { exportAllData, importAllData, saveProfile } from '../services/storage';

interface SettingsBackupModalProps {
  profile: UserProfile | null;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onDataReload: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onDataReload,
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [goal, setGoal] = useState(profile?.goal || '');
  const [medium, setMedium] = useState(profile?.medium || 'digital');
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      goal: goal.trim() || profile.goal,
      medium,
    };
    await saveProfile(updated);
    onProfileUpdated(updated);
    setMessage('Perfil actualizado con éxito');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportBackup = async () => {
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
      setMessage('Respaldo exportado exitosamente en archivo JSON');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Error exportando datos');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: AppStateData = JSON.parse(text);
        if (!parsed.profile && !parsed.checks && !parsed.milestones) {
          throw new Error('Formato de respaldo no válido');
        }

        if (window.confirm('¿Seguro que deseas restaurar este respaldo? Se sobrescribirán tus datos actuales.')) {
          await importAllData(parsed);
          setMessage('¡Datos restaurados con éxito!');
          setTimeout(() => {
            onDataReload();
            onClose();
          }, 1000);
        }
      } catch (err) {
        console.error('Error importing data:', err);
        alert('El archivo no es un respaldo válido de Art Street');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('¿ATENCIÓN: Estás seguro de borrar todos tus datos y progreso? Esta acción no se puede deshacer a menos que tengas un respaldo JSON.')) {
      localStorage.clear();
      window.indexedDB.deleteDatabase('ArtStreetDB');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#111c30] border border-white/[0.1] w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-4 sm:p-8 shadow-2xl my-auto sm:my-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-fantasy-sky/15 border border-fantasy-sky/30 flex items-center justify-center text-fantasy-sky flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-black text-lg sm:text-xl text-white truncate">
                Ajustes y Respaldo
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-sans font-medium truncate">
                Tus datos residen de forma 100% privada y local en tu dispositivo
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

        {message && (
          <div className="mt-4 p-3 bg-fantasy-lime/15 border border-fantasy-lime/30 rounded-2xl text-xs text-fantasy-lime font-display font-bold text-center">
            {message}
          </div>
        )}

        {/* Profile Details Edit */}
        <div className="my-5 space-y-3">
          <h4 className="text-xs font-display font-bold text-fantasy-pink uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-fantasy-pink" />
            <span>Perfil del Artista</span>
          </h4>

          <div>
            <label className="block text-xs font-display font-bold text-slate-300 mb-1">Nombre o Alias</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-fantasy-sky font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display font-bold text-slate-300 mb-1">Medio</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as 'digital' | 'traditional' | 'both')}
                className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-fantasy-sky font-medium"
              >
                <option value="digital">Digital</option>
                <option value="traditional">Tradicional</option>
                <option value="both">Mixto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-slate-300 mb-1">Meta Principal</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-fantasy-sky font-medium"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-fantasy-sky to-fantasy-pink hover:opacity-95 text-white font-display font-black py-2.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-fantasy-sky/20"
          >
            Actualizar Perfil
          </button>
        </div>

        {/* Backup & Restore */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3">
          <h4 className="text-xs font-display font-bold text-fantasy-lime uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-fantasy-lime" />
            <span>Seguridad y Portabilidad</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-4 rounded-2xl bg-[#0b1320] hover:bg-[#142035] border border-white/[0.08] flex items-center gap-3 text-left transition-colors group"
            >
              <div className="w-10 h-10 rounded-2xl bg-fantasy-sky/15 group-hover:bg-fantasy-sky/25 text-fantasy-sky flex items-center justify-center border border-fantasy-sky/30">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-display font-bold text-white">Exportar Respaldo</p>
                <p className="text-[11px] font-sans text-slate-400">Descarga un archivo JSON</p>
              </div>
            </button>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl bg-[#0b1320] hover:bg-[#142035] border border-white/[0.08] flex items-center gap-3 text-left transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-fantasy-lime/15 group-hover:bg-fantasy-lime/25 text-fantasy-lime flex items-center justify-center border border-fantasy-lime/30">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-display font-bold text-white">Restaurar Respaldo</p>
                <p className="text-[11px] font-sans text-slate-400">Carga un archivo previo</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearData}
            className="w-full text-xs text-red-400 hover:text-red-300 font-display font-bold py-2 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Restablecer y Borrar Datos Locales</span>
          </button>
        </div>

        {/* Credits & Community */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-display font-bold text-white">
            <Heart className="w-4 h-4 text-fantasy-pink fill-fantasy-pink" />
            <span>Créditos y Comunidad Artística</span>
          </div>
          <p className="font-sans font-medium text-slate-300 leading-relaxed">
            Basado en la estructura del legendario <strong>Curriculum for the Solo Artist</strong> diseñado por <strong>Alex Huneycutt (@RadioRunner)</strong> en Reddit, inspirado a su vez en ARTSchool de Marc Brunet.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-fantasy-skyLight font-display font-bold">
            <a
              href="https://www.soloartcurriculum.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>soloartcurriculum.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://drawabox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>drawabox.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.proko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>proko.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
