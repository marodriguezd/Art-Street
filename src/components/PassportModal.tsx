import React from 'react';
import { FileJson, X } from 'lucide-react';

export type MainGoal = 'illustration' | 'anatomy' | 'portfolio';
export type Medium = 'digital' | 'traditional' | 'mixed';

export interface Passport {
  name: string;
  medium: Medium;
  goal: MainGoal;
  currentStation: number;
}

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  passport: Passport;
  onSave: (passport: Passport) => void;
  onOpenBackup: () => void;
  onSkip?: () => void;
}

const GOALS: { id: MainGoal; title: string; desc: string }[] = [
  { id: 'illustration', title: 'Ilustración y Concept Art profesional', desc: 'Creación de mundos, personajes y piezas narrativas terminadas' },
  { id: 'anatomy', title: 'Dominio anatómico y figura humana', desc: 'Estudio profundo de la figura viva, movimiento y estructura' },
  { id: 'portfolio', title: 'Desarrollo de portafolio profesional', desc: 'Desarrollo de disciplina, constancia y nivel de la industria' },
];

const MEDIUMS: { id: Medium; label: string; icon: string; desc: string }[] = [
  { id: 'digital', label: 'Digital', icon: '💻', desc: 'Tableta / iPad / PC' },
  { id: 'traditional', label: 'Tradicional', icon: '✏️', desc: 'Papel, Grafito u Óleo' },
  { id: 'mixed', label: 'Mixto', icon: '🎨', desc: 'Híbrido analógico y digital' },
];

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  passport,
  onSave,
  onOpenBackup,
  onSkip,
}) => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [formData, setFormData] = React.useState<Passport>(passport);

  React.useEffect(() => {
    setFormData(passport);
  }, [passport]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-pink-400 uppercase rounded-full bg-pink-500/10 border border-pink-500/20">
              PASAPORTE // PASO 0{step} DE 02
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === 1 ? (
            <>
              {/* Clean Import Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <FileJson className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">¿Tienes un respaldo o cuenta previa?</div>
                    <div className="text-[11px] text-slate-400">Importa vía enlace o archivo JSON</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBackup();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
                >
                  IMPORTAR
                </button>
              </div>

              {/* Monograph Title */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider text-slate-400 rounded-full bg-slate-800/50 border border-slate-700/50 uppercase">
                  <span>REGISTRO DEL VIAJERO // EDICIÓN IN WITCH</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
                  El Camino del Artista
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Currículum estructurado de 9 estaciones basado en la metodología de Alex Huneycutt (@RadioRunner). Desde el dibujo de formas primarias hasta la maestría de la figura viva.
                </p>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-2">
                    ¿Cómo te llamas o cuál es tu alias artístico?
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej. Clara, Alex, Dibujante99"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-2">
                    ¿Qué medio utilizas principalmente?
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {MEDIUMS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, medium: m.id })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.medium === m.id
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/5'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xl mb-1">{m.icon}</div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-300 uppercase mb-2">
                    ¿Cuál es tu meta principal?
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as MainGoal })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-pink-500/50"
                  >
                    {GOALS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-100">Selecciona tu punto de partida</h3>
                <p className="text-xs text-slate-400">Puedes empezar desde la Estación I o saltar a la que encaje con tu nivel actual.</p>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((stationIdx) => (
                  <button
                    key={stationIdx}
                    type="button"
                    onClick={() => setFormData({ ...formData, currentStation: stationIdx })}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      formData.currentStation === stationIdx
                        ? 'bg-pink-500/10 border-pink-500/50 text-pink-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">Estación 0{stationIdx + 1}</span>
                    <span className="text-[11px] text-slate-500">Comenzar aquí →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-pink-400 to-rose-400 hover:from-sky-300 hover:to-rose-300 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all active:scale-[0.99]"
            >
              {step === 1 ? 'CONTINUAR AL PUNTO DE PARTIDA →' : 'GUARDAR PASAPORTE E INICIAR'}
            </button>
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center transition-colors font-mono"
              >
                [ EXPLORAR LA MONOGRAFÍA COMO INVITADO ]
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
