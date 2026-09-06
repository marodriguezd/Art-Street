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
      <div className="bg-[#111c30] border border-white/[0.1] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        {!showCelebrationScreen ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-fantasy-ochre/15 border border-fantasy-ochre/30 flex items-center justify-center text-fantasy-ochre font-display text-2xl font-black">
                  🎓
                </div>
                <div>
                  <span className="font-display text-xs font-bold tracking-wider uppercase text-fantasy-ochre">
                    CERTIFICADO DE ESTACIÓN // ESTACIÓN {term.number} (FASE {['I','II','III','IV','V','VI','VII','VIII','IX'][term.number - 1] || term.number})
                  </span>
                  <h3 className="font-display text-2xl font-black text-white tracking-tight">
                    {term.graduationPrompt.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brief and Requirements */}
            <div className="my-4 p-4 rounded-2xl bg-[#0d1017] border border-white/[0.08] text-xs">
              <p className="text-slate-200 leading-relaxed font-sans mb-3 font-medium">
                {term.graduationPrompt.brief}
              </p>
              <h5 className="font-display text-xs tracking-wider uppercase font-bold text-fantasy-sky mb-2">
                CRITERIOS DE MAESTRÍA ARTÍSTICA:
              </h5>
              <ul className="space-y-1.5 text-slate-300 font-sans">
                {term.graduationPrompt.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-fantasy-sky font-display font-bold text-xs mt-0.5">[{i + 1}]</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              {imageDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0d1017] p-4 text-center">
                  <div className="border border-dashed border-fantasy-sky/40 rounded-xl p-2 bg-[#080d16]">
                    <img
                      src={imageDataUrl}
                      alt="Obra de graduación"
                      className="max-h-60 mx-auto rounded-lg object-contain shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="mt-3 font-display text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider"
                  >
                    [ Descartar y Cargar Otra Obra ]
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-sky rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#0d1017] hover:bg-[#0f192b] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-fantasy-sky/15 group-hover:bg-fantasy-sky/25 text-fantasy-sky flex items-center justify-center transition-all border border-fantasy-sky/30">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-white">Subir Obra Terminada</p>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">JPG, PNG o WEBP</p>
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
                    className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-pink rounded-2xl p-5 text-center cursor-pointer transition-all bg-[#0d1017] hover:bg-[#0f192b] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-fantasy-pink/15 group-hover:bg-fantasy-pink/25 text-fantasy-pink flex items-center justify-center transition-all border border-fantasy-pink/30">
                      <Brush className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-white">Trazar en Bloc Digital</p>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">Lienzo integrado</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                  Título de la Obra de Graduación:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Estudio de Busto en Contrapicado, Iluminación de Ocaso"
                  className="w-full bg-[#0d1017] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-fantasy-sky"
                />
              </div>

              {/* Reflection and Self-Critique */}
              <div>
                <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                  Autocrítica y Reflexión Técnica (¿Qué salto notas frente a tu Punto de Partida?):
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="ej. Noto que ahora entiendo cómo encajar los rasgos en la esfera y ya no dibujo ojos planos..."
                  rows={3}
                  className="w-full bg-[#0d1017] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-fantasy-sky resize-none font-medium"
                />
              </div>

              {/* Hours and Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                    Horas de Trabajo
                  </label>
                  <div className="flex items-center gap-2 bg-[#0d1017] border border-white/[0.1] rounded-2xl px-3.5 py-2">
                    <Clock className="w-4 h-4 text-fantasy-sky" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="bg-transparent text-white text-xs w-full focus:outline-none font-display font-bold"
                    />
                    <span className="font-display text-xs font-bold text-slate-400">HRS</span>
                  </div>
                </div>

                <div>
                  <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                    Confianza Técnica
                  </label>
                  <div className="flex items-center gap-1 bg-[#0d1017] border border-white/[0.1] rounded-2xl px-3 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-slate-600 hover:text-fantasy-ochre transition-colors"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'text-fantasy-ochre fill-fantasy-ochre' : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 bg-[#0d1017] hover:bg-[#142035] border border-white/[0.08] text-slate-300 font-display text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleSubmit}
                  className="w-2/3 btn-atelier-primary "
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando...' : `Graduar Estación ${term.number} (+500 XP)`}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Celebration Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-fantasy-lime/15 border border-fantasy-lime/30 text-fantasy-lime mx-auto flex items-center justify-center font-display text-3xl font-black mb-4">
              ✨
            </div>
            <span className="font-display text-xs font-bold tracking-wider uppercase text-fantasy-lime">
              ¡DIPLOMA DE ESTACIÓN CONCEDIDO!
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Graduado de la Estación {term.number}
            </h2>
            <p className="text-xs text-slate-200 mt-2 max-w-md mx-auto leading-relaxed font-sans font-medium">
              Has consolidado las unidades didácticas y depositado tu obra en el atelier del pueblo. ¡Compara tu evolución con tu Punto de Partida original!
            </p>

            <div className="my-6 max-w-sm mx-auto rounded-3xl overflow-hidden border border-white/[0.1] bg-[#0d1017] p-4 shadow-xl">
              <div className="border border-dashed border-fantasy-sky/40 rounded-2xl p-2 bg-[#080d16]">
                <img
                  src={imageDataUrl!}
                  alt="Obra de graduación entregada"
                  className="max-h-56 mx-auto rounded-xl object-contain shadow-lg"
                />
              </div>
              <p className="font-display text-sm font-bold text-white mt-3">{title}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-[#0d1017] hover:bg-[#142035] border border-white/[0.08] text-slate-300 font-display text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-2xl"
              >
                Volver al Mapa
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToEvolution();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-fantasy-sky to-fantasy-pink hover:opacity-95 text-white font-display text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-lg shadow-fantasy-sky/20 flex items-center justify-center gap-2"
              >
                <span>Ver en Estudio de Evolución</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
