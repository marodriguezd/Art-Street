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
      <div className="bg-[#0c0e14] border border-studio-800/80 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative drafting-corner my-8">
        {!showCelebrationScreen ? (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-studio-800/80">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-serif text-2xl">
                  ✦
                </div>
                <div>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400">
                    ACTA DE EGRESO // TÉRMINO {term.number} (FOLIO {['I','II','III','IV','V','VI','VII','VIII','IX'][term.number - 1] || term.number})
                  </span>
                  <h3 className="font-serif text-2xl text-white italic tracking-tight">
                    {term.graduationPrompt.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-studio-800/60 hover:bg-studio-800 text-studio-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Brief and Requirements */}
            <div className="my-4 p-4 rounded-xl bg-[#08090d] border border-studio-800/80 text-xs">
              <p className="text-studio-300 leading-relaxed font-sans mb-3">
                {term.graduationPrompt.brief}
              </p>
              <h5 className="font-mono text-[10px] tracking-widest uppercase text-amber-400 mb-2">
                CRITERIOS EXIGIDOS POR EL CURRÍCULUM:
              </h5>
              <ul className="space-y-1.5 text-studio-400 font-sans">
                {term.graduationPrompt.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500/60 font-mono text-[10px] mt-0.5">[{i + 1}]</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              {imageDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-studio-700/80 bg-[#08090d] p-3 text-center">
                  <div className="border border-dashed border-studio-800/80 rounded-lg p-2 bg-[#050608]">
                    <img
                      src={imageDataUrl}
                      alt="Obra de graduación"
                      className="max-h-60 mx-auto rounded object-contain shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl(null)}
                    className="mt-2 font-mono text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider"
                  >
                    [ Descartar y Cargar Otra Obra ]
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Subir Obra Terminada</p>
                      <p className="font-mono text-[10px] text-studio-500 mt-0.5">JPG, PNG o WEBP</p>
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
                    className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                      <Brush className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Trazar en Bloc Digital</p>
                      <p className="font-mono text-[10px] text-studio-500 mt-0.5">Lienzo integrado</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1">
                  Título de la Obra de Graduación:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Estudio de Busto en Contrapicado, Iluminación de Ocaso"
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-3.5 py-2 text-white text-xs placeholder-studio-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Reflection and Self-Critique */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1">
                  Autocrítica y Reflexión Técnica (¿Qué salto notas frente al Nivel 0?):
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="ej. Noto que ahora entiendo cómo encajar los rasgos en la esfera y ya no dibujo ojos planos. Me costó la torsión del cuello pero al final quedó sólido..."
                  rows={3}
                  className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-3.5 py-2 text-white text-xs placeholder-studio-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Hours and Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1">
                    Horas de Trabajo
                  </label>
                  <div className="flex items-center gap-2 bg-[#08090d] border border-studio-800 rounded-xl px-3 py-1.5">
                    <Clock className="w-4 h-4 text-studio-500" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="bg-transparent text-white text-xs w-full focus:outline-none font-mono"
                    />
                    <span className="font-mono text-[10px] text-studio-500">HRS</span>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-300 mb-1">
                    Confianza Técnica
                  </label>
                  <div className="flex items-center gap-1 bg-[#08090d] border border-studio-800 rounded-xl px-3 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-studio-700 hover:text-amber-400 transition-colors"
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
                  className="w-1/3 bg-studio-800/80 hover:bg-studio-800 text-studio-300 font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !imageDataUrl}
                  onClick={handleSubmit}
                  className="w-2/3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registrando...' : `Graduar Folio ${term.number} (+500 XP)`}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Celebration Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center font-serif text-3xl mb-4">
              ✦
            </div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400">
              FOLIO DE EGRESO VALIDADO
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white mt-1 italic">
              Graduado del Término {term.number}
            </h2>
            <p className="text-xs text-studio-300 mt-2 max-w-md mx-auto leading-relaxed">
              Has consolidado las unidades didácticas y depositado tu obra en el archivo del atelier. Compara tu evolución con tu Punto de Partida original.
            </p>

            <div className="my-6 max-w-sm mx-auto rounded-xl overflow-hidden border border-studio-700/80 bg-[#08090d] p-3">
              <div className="border border-dashed border-studio-800/80 rounded-lg p-2 bg-[#050608]">
                <img
                  src={imageDataUrl!}
                  alt="Obra de graduación entregada"
                  className="max-h-56 mx-auto rounded object-contain shadow-lg"
                />
              </div>
              <p className="font-serif text-sm italic text-white mt-2.5">{title}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-studio-800/80 hover:bg-studio-800 text-studio-300 font-mono text-xs uppercase tracking-wider py-3 px-6 rounded-xl"
              >
                Volver al Currículum
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToEvolution();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
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
