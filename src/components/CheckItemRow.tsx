import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Camera, 
  Brush, 
  Tag, 
  Clock 
} from 'lucide-react';
import { CheckItem, CheckState } from '../types/curriculum';

interface CheckItemRowProps {
  check: CheckItem;
  state?: CheckState;
  onToggleCheck: (checkId: string) => void;
  onOpenProofModal: (check: CheckItem) => void;
  onOpenSketchpad: (check: CheckItem) => void;
}

export const CheckItemRow: React.FC<CheckItemRowProps> = ({
  check,
  state,
  onToggleCheck,
  onOpenProofModal,
  onOpenSketchpad,
}) => {
  const isCompleted = state?.completed || false;
  const proofImages = state?.images || [];

  return (
    <div
      className={`group p-4 sm:p-5 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-[#0f192b]/60 border-fantasy-lime/30 text-slate-400'
          : 'bg-[#111c30]/90 hover:bg-[#15233c] border-white/[0.08] hover:border-fantasy-sky/40 text-slate-200 shadow-md'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Verification Checkbox */}
        <button
          type="button"
          onClick={() => onToggleCheck(check.id)}
          className={`mt-0.5 p-1 rounded-xl transition-all flex-shrink-0 ${
            isCompleted
              ? 'text-fantasy-lime scale-105'
              : 'text-slate-500 hover:text-fantasy-sky hover:scale-105'
          }`}
          title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-fantasy-lime/20" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h4
              onClick={() => onToggleCheck(check.id)}
              className={`font-display font-bold text-sm sm:text-base cursor-pointer transition-colors ${
                isCompleted
                  ? 'line-through text-slate-500'
                  : 'text-white group-hover:text-fantasy-sky'
              }`}
            >
              {check.title}
            </h4>

            {check.targetCount && (
              <span className="font-display text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0b1320] text-fantasy-ochre border border-fantasy-ochre/30">
                META: {check.targetCount}
              </span>
            )}

            {check.recommendedDuration && (
              <span className="font-display flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-[#0b1320] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                <Clock className="w-3 h-3 text-fantasy-sky" />
                <span>{check.recommendedDuration}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium mb-3">
            {check.description}
          </p>

          {/* Tags and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {check.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-display text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-[#0b1320] px-2.5 py-0.5 rounded-full border border-white/[0.04] flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-fantasy-pink/70" />
                  <span>#{tag}</span>
                </span>
              ))}
            </div>

            {/* Proof Attachment Buttons & Thumbnails */}
            <div className="flex items-center gap-2">
              {/* Thumbnail Gallery Preview if images exist */}
              {proofImages.length > 0 && (
                <div
                  onClick={() => onOpenProofModal(check)}
                  className="flex items-center gap-1.5 cursor-pointer bg-[#0b1320] hover:bg-[#15233c] px-2.5 py-1 rounded-xl border border-white/[0.08] transition-colors"
                  title="Ver dibujos adjuntos"
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    {proofImages.slice(0, 3).map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.dataUrl}
                        alt="Miniatura"
                        className="inline-block h-6 w-6 rounded-lg ring-1 ring-white/20 object-cover"
                      />
                    ))}
                  </div>
                  <span className="font-display text-[10px] font-bold text-fantasy-pink ml-1">
                    {proofImages.length}
                  </span>
                </div>
              )}

              {/* Upload Proof Button */}
              <button
                type="button"
                onClick={() => onOpenProofModal(check)}
                className="flex items-center gap-1.5 font-display text-[10px] font-bold text-slate-200 hover:text-white bg-[#0b1320] hover:bg-[#15233c] px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-fantasy-sky/40 transition-colors"
                title="Adjuntar dibujo o foto de práctica"
              >
                <Camera className="w-3.5 h-3.5 text-fantasy-sky" />
                <span className="hidden sm:inline">ADJUNTAR</span>
              </button>

              {/* Sketchpad Direct Button */}
              <button
                type="button"
                onClick={() => onOpenSketchpad(check)}
                className="flex items-center gap-1.5 font-display text-[10px] font-bold text-fantasy-pink hover:text-white bg-fantasy-pink/10 hover:bg-fantasy-pink/20 px-3 py-1.5 rounded-xl border border-fantasy-pink/30 transition-colors"
                title="Abrir bloc digital para este ejercicio"
              >
                <Brush className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DIBUJAR</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
