import React, { useState, useRef } from 'react';
import { 
  X, 
  Award, 
  Camera, 
  Brush, 
  Star, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Term, MilestoneArtwork } from '../types/curriculum';
import { saveMilestone } from '../services/storage';
import { playCelebrationFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';

interface GraduationModalProps {
  term: Term;
  existingArtwork?: MilestoneArtwork;
  onClose: () => void;
  onGraduated: (artwork: MilestoneArtwork) => void;
  onOpenCanvas: () => void;
  temporaryCanvasImage?: string | null;
  onGoToEvolution: () => void;
}

export const GraduationModal: React.FC<GraduationModalProps> = ({
  term,
  existingArtwork,
  onClose,
  onGraduated,
  onOpenCanvas,
  temporaryCanvasImage,
  onGoToEvolution,
}) => {
  const [title, setTitle] = useState(existingArtwork?.title || `Obra de Graduación: Término ${term.number}`);
  const [reflection, setReflection] = useState(existingArtwork?.reflectionNotes || '');
  const [hours, setHours] = useState(existingArtwork?.hoursSpent || 6);
  const [rating, setRating] = useState(existingArtwork?.confidenceRating || 4);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(existingArtwork?.dataUrl || temporaryCanvasImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebrationScreen, setShowCelebrationScreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (temporaryCanvasImage) {
      setImageDataUrl(temporaryCanvasImage);
    }
  }, [temporaryCanvasImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageDataUrl) {
      alert('Por favor sube o dibuja tu obra de graduación para este término');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const milestone: MilestoneArtwork = {
        id: `milestone_term_${term.number}`,
        termNumber: term.number,
        termTitle: term.title,
        title: title.trim() || `Graduación Término ${term.number}`,
        dataUrl: imageDataUrl,
        date: today,
        reflectionNotes: reflection.trim() || 'Obra completada aplicando los conceptos aprendidos en este término.',
        hoursSpent: Number(hours),
        confidenceRating: rating,
      };

      await saveMilestone(milestone);

      playCelebrationFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });

      onGraduated(milestone);
      setShowCelebrationScreen(true);
    } catch (err) {
      console.error('Error saving graduation milestone:', err);
      alert('Error al guardar graduación. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {!showCelebrationScreen ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-studio-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Graduación del Término {term.number}
                  </span>
                  <h3 className="font-display font-black text-xl text-white">
                    {term.graduationPrompt.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-studio-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brief and Requirements */}
            <div className="my-4 p-4 rounded-2xl bg-studio-950/70 border border-studio-800 text-xs">
              <p className="text-studio-300 leading-relaxed font-medium mb-3">
                {term.graduationPrompt.brief}
              </p>
              <h5 className="font-bold text-orange-400 uppercase tracking-wider text-[11px] mb-1.5">
                Requisitos para esta obra:
              </h5>
              <ul className="space-y-1 text-studio-400 list-disc list-inside">
                {term.graduationPrompt.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              {imageDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-studio-700 bg-studio-950 p-2 text-center">
                  <img
                    src={imageDataUrl}
                    alt="Obra de graduación"
                    className="max-h-60 mx-auto rounded-xl object-contain"
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
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-studio-700 hover:border-orange-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800 group-hover:bg-orange-500/20 text-studio-400 group-hover:text-orange-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Subir Obra Terminada</p>
                      <p className="text-[10px] text-studio-400">JPG, PNG o WEBP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div
                    onClick={onOpenCanvas}
                    className="border-2 border-dashed border-studio-700 hover:border-purple-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800 group-hover:bg-purple-500/20 text-studio-400 group-hover:text-purple-400 flex items-center justify-center">
                      <Brush className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Dibujar en Lienzo</p>
                      <p className="text-[10px] text-studio-400">Bloc digital integrado</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-studio-300 mb-1">
                  Título de tu Obra
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Estudio de Busto en Contrapicado, Iluminación de Ocaso"
                  className="w-full bg-studio-950 border border-studio-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Reflection and Self-Critique */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-studio-300 mb-1">
                  Autocrítica y Reflexión (¿Qué mejoras notas frente a tu inicio?)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="ej. Noto que ahora entiendo cómo encajar los rasgos en la esfera y ya no dibujo ojos planos. Me costó la torsión del cuello pero al final quedó sólido..."
                  rows={3}
                  className="w-full bg-studio-950 border border-studio-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Hours and Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-studio-300 mb-1">
                    Horas dedicadas
                  </label>
                  <div className="flex items-center gap-2 bg-studio-950 border border-studio-800 rounded-xl px-3 py-1.5">
                    <Clock className="w-4 h-4 text-studio-400" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="bg-transparent text-white text-xs w-full focus:outline-none"
                    />
                    <span className="text-[11px] text-studio-400">horas</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-studio-300 mb-1">
                    Confianza técnica
                  </label>
                  <div className="flex items-center gap-1 bg-studio-950 border border-studio-800 rounded-xl px-3 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-studio-600 hover:text-amber-400"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 bg-studio-800 hover:bg-studio-700 text-studio-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleSubmit}
                  className="w-2/3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Graduando...' : `Graduar Término ${term.number} (+500 XP)`}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Celebration Screen */
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white mx-auto flex items-center justify-center shadow-2xl shadow-orange-500/30 text-4xl mb-4">
              🏆
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              ¡Hito Histórico Conquistado!
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
              ¡Te has graduado del Término {term.number}!
            </h2>
            <p className="text-xs sm:text-sm text-studio-300 mt-2 max-w-md mx-auto leading-relaxed">
              Has completado las lecciones y entregado tu obra de evaluación. Ahora ve al <strong>Estudio de Evolución</strong> para comparar tu salto técnico con tu punto de partida inicial.
            </p>

            <div className="my-6 max-w-sm mx-auto rounded-2xl overflow-hidden border border-studio-700 bg-studio-950 p-2">
              <img
                src={imageDataUrl!}
                alt="Obra de graduación entregada"
                className="max-h-56 mx-auto rounded-xl object-contain shadow-lg"
              />
              <p className="text-xs font-bold text-white mt-2">{title}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-studio-800 hover:bg-studio-700 text-studio-200 font-bold py-3 px-6 rounded-xl text-xs"
              >
                Volver al Currículum
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToEvolution();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <span>Ver Mi Evolución en el Comparador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
