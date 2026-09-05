import React, { useState, useRef } from 'react';
import { Sparkles, Upload, CheckCircle, ArrowRight, Brush } from 'lucide-react';
import { UserProfile, MediumType, MilestoneArtwork } from '../types/curriculum';
import { saveProfile, saveMilestone } from '../services/storage';
import { playCelebrationFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
  openCanvasForBaseline: () => void;
  temporaryCanvasImage?: string | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  openCanvasForBaseline,
  temporaryCanvasImage,
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
      <div className="bg-[#0c0e14] border border-studio-800/80 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative drafting-corner my-8">
        {/* Step Indicator / Folio Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-studio-800/80">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTA DE INGRESO // PASO 0{step} DE 02</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-studio-500">FASE</span>
            <div className="flex gap-1.5">
              <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-amber-500' : 'bg-studio-800'}`} />
              <div className={`w-8 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-studio-800'}`} />
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20 text-2xl font-serif">
                ✦
              </div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-studio-400 mb-1">
                REGISTRO ACADÉMICO DEL ARTISTA
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight italic">
                El Camino del Artista
              </h2>
              <p className="text-xs text-studio-300 mt-2 max-w-md mx-auto leading-relaxed">
                Currículum estructurado de 9 términos basado en la metodología de Alex Huneycutt (@RadioRunner). Desde fundamentos del trazo hasta la maestría conceptual.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1.5">
                  Identidad o Alias de Taller:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Clara, Alex, Dibujante99"
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-4 py-3 text-white placeholder-studio-600 focus:outline-none focus:border-amber-500 transition-all text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1.5">
                  Soporte Primario de Trabajo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'digital', label: '💻 Digital (Wacom/iPad)' },
                    { id: 'traditional', label: '✏️ Tradicional (Grafito/Óleo)' },
                    { id: 'both', label: '🎨 Mixto' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMedium(m.id as MediumType)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        medium === m.id
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-[#08090d] border-studio-800/80 text-studio-400 hover:border-studio-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1.5">
                  Especialidad u Objetivo de Graduación:
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all text-xs font-medium"
                >
                  <option value="Ilustración y Concept Art">Ilustración y Concept Art profesional</option>
                  <option value="Cómic, Manga y Webtoon">Creación de Cómic, Manga o Novelas Gráficas</option>
                  <option value="Diseño de Personajes y Criaturas">Diseño de Personajes y Criaturas</option>
                  <option value="Dibujo por Pasión y Superación">Dibujo por pasión personal y autoaprendizaje</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      alert('Por favor introduce tu nombre antes de continuar');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 text-xs uppercase font-mono tracking-wider transition-all"
                >
                  <span>Continuar al Registro de Nivel 0</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px] tracking-widest uppercase mb-2 border border-amber-500/20">
                ✦ REGISTRO DE LÍNEA BASE // HITO CERO
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-tight italic">
                Tu Punto de Partida
              </h2>
              <p className="text-xs text-studio-300 mt-1 max-w-md mx-auto leading-relaxed">
                Sube tu dibujo más reciente, boceto o estudio actual. Este archivo será tu <strong>Nivel 0</strong> en el comparador de evolución técnica.
              </p>
            </div>

            <div className="space-y-4">
              {/* Image Preview / Upload Area */}
              {imageDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-studio-700/80 bg-[#08090d] p-3 text-center">
                  <div className="relative border border-dashed border-studio-800/80 rounded-lg p-2 bg-[#050608]">
                    <img
                      src={imageDataUrl}
                      alt="Punto de partida"
                      className="max-h-56 mx-auto rounded object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="mt-2 font-mono text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider"
                  >
                    [ Descartar y Cargar Otra Imagen ]
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Cargar Archivo Local</p>
                      <p className="font-mono text-[10px] text-studio-500 mt-0.5">JPG, PNG o WEBP</p>
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
                    className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                      <Brush className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Trazar en Bloc Digital</p>
                      <p className="font-mono text-[10px] text-studio-500 mt-0.5">Dibujar en pantalla ahora</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1.5">
                  Título de la Obra o Estudio:
                </label>
                <input
                  type="text"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  placeholder="ej. Retrato rápido, Mi personaje favorito"
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-3.5 py-2.5 text-white placeholder-studio-600 focus:outline-none focus:border-amber-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1.5">
                  Diagnóstico y Desafíos Actuales:
                </label>
                <textarea
                  value={drawingNotes}
                  onChange={(e) => setDrawingNotes(e.target.value)}
                  placeholder="ej. Rigidez en poses, dificultad con la tridimensionalidad y volumen de las manos, inseguridad al aplicar sombras directas..."
                  rows={3}
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-3.5 py-2.5 text-white placeholder-studio-600 focus:outline-none focus:border-amber-500 text-xs font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-studio-800/80 hover:bg-studio-800 text-studio-300 font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all"
                >
                  Volver
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleFinalSubmit}
                  className="w-2/3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando...' : 'Ingresar al Atelier'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
