import React, { useState, useRef } from 'react';
import { Sparkles, Upload, CheckCircle, ArrowRight, Brush, X } from 'lucide-react';
import { UserProfile, MediumType, MilestoneArtwork } from '../types/curriculum';
import { saveProfile, saveMilestone } from '../services/storage';
import { playCelebrationFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
  openCanvasForBaseline: () => void;
  temporaryCanvasImage?: string | null;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  openCanvasForBaseline,
  temporaryCanvasImage,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [medium, setMedium] = useState<MediumType>('digital');
  const [goal, setGoal] = useState('Ilustración y Concept Art');
  
  // Baseline Drawing states
  const [drawingTitle, setDrawingTitle] = useState('Mi Punto de Partida (Nivel 0)');
  const [drawingNotes, setDrawingNotes] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(temporaryCanvasImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if canvas generated an image
  React.useEffect(() => {
    if (temporaryCanvasImage) {
      setImageDataUrl(temporaryCanvasImage);
    }
  }, [temporaryCanvasImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa tu nombre o alias de artista');
      return;
    }

    if (!imageDataUrl) {
      alert('¡Es fundamental subir tu dibujo inicial! Será el espejo donde verás tu evolución.');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const baseline = {
        title: drawingTitle.trim() || 'Mi Punto de Partida',
        dataUrl: imageDataUrl,
        date: today,
        notes: drawingNotes.trim() || 'Dibujo inicial antes de comenzar el currículum del artista autodidacta.',
      };

      const newProfile: UserProfile = {
        id: 'current_user',
        name: name.trim(),
        medium,
        goal,
        baselineArtwork: baseline,
        createdAt: today,
        xp: 150, // bonus for onboarding
        streakDays: 1,
        lastActiveDate: today,
      };

      // Also save as Milestone 0 for the evolution studio
      const milestoneZero: MilestoneArtwork = {
        id: 'milestone_term_0',
        termNumber: 0,
        termTitle: 'Punto de Partida (Nivel 0)',
        title: baseline.title,
        dataUrl: imageDataUrl,
        date: today,
        reflectionNotes: baseline.notes,
        hoursSpent: 1,
        confidenceRating: 2,
      };

      await saveProfile(newProfile);
      await saveMilestone(milestoneZero);

      playCelebrationFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onComplete(newProfile);
    } catch (err) {
      console.error('Error saving onboarding profile:', err);
      alert('Error guardando perfil. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111c30] border border-white/[0.1] w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Step Indicator / Folio Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase font-bold tracking-widest text-fantasy-pink">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PASAPORTE DEL ARTISTA // PASO 0{step} DE 02</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">FASE</span>
              <div className="flex gap-1.5">
                <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-fantasy-sky' : 'bg-slate-800'}`} />
                <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-fantasy-pink' : 'bg-slate-800'}`} />
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
                title="Cerrar y explorar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="text-center mb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-fantasy-sky bg-fantasy-sky/15 px-3 py-1 rounded-full border border-fantasy-sky/30 inline-block mb-3">
                REGISTRO DEL VIAJERO // EDICIÓN IN WITCH
              </span>
              <h2 className="font-serif italic text-4xl sm:text-5xl text-white tracking-tight leading-none">
                El Camino del Artista
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-md mx-auto leading-relaxed font-sans font-normal">
                Currículum estructurado de 9 estaciones basado en la metodología de Alex Huneycutt (@RadioRunner). Desde el dibujo de formas primarias hasta la maestría de la figura viva.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                  ¿Cómo te llamas o cuál es tu alias artístico?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Clara, Alex, Dibujante99"
                  className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-fantasy-sky transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                  ¿Qué medio utilizas principalmente?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'digital', label: '💻 Digital (Tableta/iPad)' },
                    { id: 'traditional', label: '✏️ Tradicional (Papel/Óleo)' },
                    { id: 'both', label: '🎨 Mixto' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMedium(m.id as MediumType)}
                      className={`py-3 px-3 rounded-2xl text-xs font-display font-bold border transition-all text-center ${
                        medium === m.id
                          ? 'bg-fantasy-sky/20 border-fantasy-sky text-fantasy-sky shadow-sm'
                          : 'bg-[#0b1320] border-white/[0.08] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                  ¿Cuál es tu meta principal?
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-fantasy-sky transition-all text-xs font-medium"
                >
                  <option value="Ilustración y Concept Art">Ilustración y Concept Art profesional</option>
                  <option value="Cómic, Manga y Webtoon">Creación de Cómic, Manga o Novelas Gráficas</option>
                  <option value="Diseño de Personajes y Criaturas">Diseño de Personajes y Criaturas</option>
                  <option value="Dibujo por Pasión y Superación">Dibujo por pasión personal y autoaprendizaje</option>
                </select>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      alert('Por favor introduce tu nombre antes de continuar');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-gradient-to-r from-fantasy-sky to-fantasy-pink hover:opacity-95 text-white font-mono text-xs font-bold uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-fantasy-sky/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Continuar al Punto de Partida</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full text-slate-400 hover:text-white font-mono text-xs uppercase tracking-wider py-2 transition-colors"
                  >
                    [ Explorar la Monografía como Invitado ]
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-fantasy-ochre/15 text-fantasy-ochre font-display text-[11px] font-bold tracking-wider uppercase mb-2 border border-fantasy-ochre/30">
                ✦ REGISTRO DE LÍNEA BASE // HITO CERO
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                Tu Punto de Partida
              </h2>
              <p className="text-xs text-slate-200 mt-2 max-w-md mx-auto leading-relaxed font-sans font-medium">
                Sube tu dibujo más reciente, boceto o estudio actual. Este archivo será tu <strong>Nivel 0</strong> en el comparador de evolución mágica.
              </p>
            </div>

            <div className="space-y-4">
              {/* Image Preview / Upload Area */}
              {imageDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0b1320] p-4 text-center">
                  <div className="relative border border-dashed border-fantasy-sky/40 rounded-xl p-2 bg-[#080d16]">
                    <img
                      src={imageDataUrl}
                      alt="Punto de partida"
                      className="max-h-56 mx-auto rounded-lg object-contain shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="mt-3 font-display text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                  >
                    [ Descartar y Cargar Otra Imagen ]
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-sky rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#0b1320] hover:bg-[#0f192b] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-fantasy-sky/15 group-hover:bg-fantasy-sky/25 text-fantasy-sky flex items-center justify-center transition-all border border-fantasy-sky/30">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-white">Cargar Archivo Local</p>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">JPG, PNG o WEBP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Draw in Canvas Option */}
                  <div
                    onClick={openCanvasForBaseline}
                    className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-pink rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#0b1320] hover:bg-[#0f192b] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-fantasy-pink/15 group-hover:bg-fantasy-pink/25 text-fantasy-pink flex items-center justify-center transition-all border border-fantasy-pink/30">
                      <Brush className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-white">Trazar en Bloc Digital</p>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">Dibujar en pantalla ahora</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                  Título de la Obra o Estudio:
                </label>
                <input
                  type="text"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  placeholder="ej. Retrato rápido, Mi personaje favorito"
                  className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-fantasy-sky text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                  Diagnóstico y Desafíos Actuales:
                </label>
                <textarea
                  value={drawingNotes}
                  onChange={(e) => setDrawingNotes(e.target.value)}
                  placeholder="ej. Rigidez en poses, dificultad con el volumen tridimensional, inseguridad al aplicar sombras directas..."
                  rows={3}
                  className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-fantasy-sky text-xs font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-[#0b1320] hover:bg-[#142035] border border-white/[0.08] text-slate-300 font-display text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-2xl transition-all"
                >
                  Volver
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleFinalSubmit}
                  className="w-2/3 bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-ochre hover:opacity-95 disabled:opacity-40 text-white font-display text-xs font-black uppercase tracking-wider py-3.5 px-4 rounded-2xl shadow-lg shadow-fantasy-sky/20 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando...' : '¡Comenzar el Viaje!'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
