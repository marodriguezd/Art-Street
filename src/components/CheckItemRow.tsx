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
      className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? 'bg-atelier-900/50 border-emerald-500/30 text-slate-300 shadow-sm'
          : 'bg-atelier-900/80 border-white/[0.08] hover:border-amber-500/40 text-slate-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleCheck(check.id)}
          className={`mt-0.5 p-1.5 rounded-xl transition-all ${
            isCompleted
              ? 'text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 shadow-sm'
              : 'text-atelier-500 hover:text-orange-400 hover:bg-orange-500/10 border border-white/[0.08]'
          }`}
          title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h4
              onClick={() => onToggleCheck(check.id)}
              className={`font-sans font-bold text-sm sm:text-base cursor-pointer transition-colors ${
                isCompleted
                  ? 'line-through text-atelier-400 group-hover:text-atelier-300'
                  : 'text-white group-hover:text-amber-300'
              }`}
            >
              {check.title}
            </h4>

            {check.targetCount && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-atelier-950 text-orange-400 border border-orange-500/30">
                META: {check.targetCount}
              </span>
            )}

            {check.recommendedDuration && (
              <span className="font-mono flex items-center gap-1 text-[10px] text-atelier-400 bg-atelier-950 px-2 py-0.5 rounded-full border border-white/[0.06]">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>{check.recommendedDuration}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-atelier-300 leading-relaxed font-light mb-3">
            {check.description}
          </p>

          {/* Tags and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {check.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] uppercase tracking-wider text-atelier-400 bg-atelier-950 px-2 py-0.5 rounded-md border border-white/[0.04] flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-orange-400/70" />
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
                  className="flex items-center gap-1.5 cursor-pointer bg-atelier-950 hover:bg-atelier-850 px-2.5 py-1 rounded-xl border border-white/[0.08] transition-colors"
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
                  <span className="font-mono text-[10px] font-bold text-orange-400 ml-1">
                    {proofImages.length}
                  </span>
                </div>
              )}

              {/* Upload Proof Button */}
              <button
                type="button"
                onClick={() => onOpenProofModal(check)}
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-200 hover:text-white bg-atelier-950 hover:bg-atelier-850 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-orange-500/40 transition-colors"
                title="Adjuntar dibujo o foto de práctica"
              >
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">ADJUNTAR</span>
              </button>

              {/* Sketchpad Direct Button */}
              <button
                type="button"
                onClick={() => onOpenSketchpad(check)}
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-200 hover:text-white bg-atelier-950 hover:bg-atelier-850 px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-purple-500/40 transition-colors"
                title="Dibujar en el lienzo integrado"
              >
                <Brush className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">LIENZO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
