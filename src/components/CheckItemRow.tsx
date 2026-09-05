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
      className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-studio-950/80 border-emerald-500/30 text-studio-200 shadow-sm'
          : 'bg-studio-950/40 border-studio-800/80 hover:border-studio-700 text-studio-300'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleCheck(check.id)}
          className={`mt-0.5 p-1 rounded-xl transition-all ${
            isCompleted
              ? 'text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25'
              : 'text-studio-500 hover:text-orange-400 hover:bg-orange-500/10'
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
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4
              onClick={() => onToggleCheck(check.id)}
              className={`font-bold text-sm cursor-pointer transition-colors ${
                isCompleted
                  ? 'line-through text-studio-400 group-hover:text-studio-300'
                  : 'text-white group-hover:text-orange-400'
              }`}
            >
              {check.title}
            </h4>

            {check.targetCount && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-studio-800 text-studio-300 border border-studio-700">
                Meta: {check.targetCount}
              </span>
            )}

            {check.recommendedDuration && (
              <span className="flex items-center gap-1 text-[10px] text-studio-400 bg-studio-900 px-2 py-0.5 rounded-full border border-studio-800">
                <Clock className="w-2.5 h-2.5" />
                <span>{check.recommendedDuration}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-studio-400 leading-relaxed mb-3">
            {check.description}
          </p>

          {/* Tags and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-studio-900">
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {check.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-studio-500 bg-studio-900 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5" />
                  <span>#{tag}</span>
                </span>
              ))}
            </div>

            {/* Proof Attachment Buttons & Thumbnails */}
            <div className="flex items-center gap-1.5">
              {/* Thumbnail Gallery Preview if images exist */}
              {proofImages.length > 0 && (
                <div
                  onClick={() => onOpenProofModal(check)}
                  className="flex items-center gap-1 cursor-pointer bg-studio-900/80 hover:bg-studio-900 px-2 py-1 rounded-xl border border-studio-800 transition-colors mr-1"
                  title="Ver dibujos adjuntos"
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    {proofImages.slice(0, 3).map((img, idx) => (
                      <img
                        key={img.id || idx}
                        src={img.dataUrl}
                        alt="Miniatura de prueba"
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-studio-950 object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 ml-1">
                    {proofImages.length}
                  </span>
                </div>
              )}

              {/* Upload Proof Button */}
              <button
                type="button"
                onClick={() => onOpenProofModal(check)}
                className="flex items-center gap-1 text-[11px] font-semibold text-studio-300 hover:text-white bg-studio-900 hover:bg-studio-800 px-2.5 py-1.5 rounded-xl border border-studio-800 transition-colors"
                title="Adjuntar dibujo o foto de práctica"
              >
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Adjuntar prueba</span>
              </button>

              {/* Sketchpad Direct Button */}
              <button
                type="button"
                onClick={() => onOpenSketchpad(check)}
                className="flex items-center gap-1 text-[11px] font-semibold text-studio-300 hover:text-white bg-studio-900 hover:bg-studio-800 px-2.5 py-1.5 rounded-xl border border-studio-800 transition-colors"
                title="Dibujar en el lienzo integrado"
              >
                <Brush className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Lienzo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
