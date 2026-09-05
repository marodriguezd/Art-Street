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
      <div className="bg-studio-900 border border-studio-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-500/10 my-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-studio-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
            <Sparkles className="w-4 h-4" />
            <span>Paso {step} de 2</span>
          </div>
          <div className="flex gap-1.5">
            <div className={`w-8 h-2 rounded-full transition-all ${step >= 1 ? 'bg-orange-500' : 'bg-studio-800'}`} />
            <div className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? 'bg-orange-500' : 'bg-studio-800'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 mb-3 border border-orange-500/20 text-3xl">
                🎨
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Bienvenido al Camino del Artista
              </h2>
              <p className="text-sm text-studio-400 mt-2 max-w-md mx-auto">
                Inspirado en el mítico <strong>Curriculum for the Solo Artist</strong> de Reddit. 9 términos estructurados paso a paso para dominar dibujo, perspectiva, anatomía, color y pintura.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-1.5">
                  ¿Cómo te llamas o cuál es tu alias artístico?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Clara, Alex, Dibujante99"
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl px-4 py-3 text-white placeholder-studio-500 focus:outline-none focus:border-orange-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-1.5">
                  ¿Qué medio utilizas principalmente?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'digital', label: '💻 Digital' },
                    { id: 'traditional', label: '✏️ Tradicional' },
                    { id: 'both', label: '🎨 Mixto' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMedium(m.id as MediumType)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        medium === m.id
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-studio-950 border-studio-800 text-studio-400 hover:border-studio-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-1.5">
                  ¿Cuál es tu meta principal?
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all text-sm font-medium"
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
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>Continuar al Punto de Partida</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 font-bold text-xs mb-2 border border-orange-500/30">
                ⭐ Registro de Línea Base
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-tight">
                Sube tu Dibujo Más Reciente
              </h2>
              <p className="text-xs text-studio-400 mt-1 max-w-md mx-auto">
                No importa si sientes que aún no sabes dibujar o si es solo un boceto. Este dibujo será tu <strong>Nivel 0</strong>. Al final de cada término compararás tus nuevas obras con este punto inicial para ver tu evolución real.
              </p>
            </div>

            <div className="space-y-4">
              {/* Image Preview / Upload Area */}
              {imageDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-studio-700 bg-studio-950 p-2 text-center">
                  <img
                    src={imageDataUrl}
                    alt="Punto de partida"
                    className="max-h-56 mx-auto rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="mt-2 text-xs text-red-400 hover:underline font-semibold"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-studio-700 hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-studio-800 group-hover:bg-orange-500/20 text-studio-400 group-hover:text-orange-400 flex items-center justify-center transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Subir archivo o foto</p>
                      <p className="text-[10px] text-studio-400 mt-0.5">JPG, PNG o WEBP</p>
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
                    className="border-2 border-dashed border-studio-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-studio-800 group-hover:bg-purple-500/20 text-studio-400 group-hover:text-purple-400 flex items-center justify-center transition-all">
                      <Brush className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Dibujar ahora en lienzo</p>
                      <p className="text-[10px] text-studio-400 mt-0.5">Abre el bloc digital integrado</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-1.5">
                  Título de tu dibujo
                </label>
                <input
                  type="text"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  placeholder="ej. Retrato rápido, Mi personaje favorito"
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl px-4 py-2.5 text-white placeholder-studio-500 focus:outline-none focus:border-orange-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-studio-300 mb-1.5">
                  Autocrítica inicial (¿Qué te cuesta más hoy?)
                </label>
                <textarea
                  value={drawingNotes}
                  onChange={(e) => setDrawingNotes(e.target.value)}
                  placeholder="ej. Siento que las manos me quedan rígidas, me cuesta entender las sombras y los volúmenes en perspectiva..."
                  rows={3}
                  className="w-full bg-studio-950 border border-studio-700 rounded-xl px-4 py-2 text-white placeholder-studio-500 focus:outline-none focus:border-orange-500 text-xs font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-studio-800 hover:bg-studio-700 text-studio-300 font-bold py-3 px-4 rounded-xl text-xs transition-all"
                >
                  Volver
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleFinalSubmit}
                  className="w-2/3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Iniciar Mi Camino'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
