import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Camera
} from 'lucide-react';
import { Term, CheckState, MilestoneArtwork } from '../types/curriculum';

interface TermCardProps {
  term: Term;
  checkStates: Record<string, CheckState>;
  milestones: MilestoneArtwork[];
  onSelectTerm: (term: Term) => void;
  onOpenGraduation: (term: Term) => void;
}

export const TermCard: React.FC<TermCardProps> = ({
  term,
  checkStates,
  milestones,
  onSelectTerm,
  onOpenGraduation,
}) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const roman = romanNumerals[term.number - 1] || String(term.number);

  // Compute progress
  const allTermChecks = term.units.flatMap((u) => u.checks);
  const totalChecks = allTermChecks.length;
  const completedChecks = allTermChecks.filter((c) => checkStates[c.id]?.completed).length;
  const progressPercent = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  // Attached proof images count
  const attachedImagesCount = allTermChecks.reduce((acc, c) => {
    return acc + (checkStates[c.id]?.images?.length || 0);
  }, 0);

  // Graduation state
  const graduationArtwork = milestones.find((m) => m.termNumber === term.number);
  const isGraduated = !!graduationArtwork;
  const canGraduated = progressPercent >= 80 || isGraduated;

  return (
    <div className="group relative bg-[#111c30]/90 hover:bg-[#15233c] backdrop-blur-xl border border-white/[0.08] hover:border-fantasy-sky/50 rounded-3xl p-6 transition-all duration-300 shadow-[0_12px_32px_rgba(11,19,32,0.6)] hover:shadow-[0_16px_40px_rgba(91,178,246,0.15)] flex flex-col justify-between overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-fantasy-sky/15 via-fantasy-pink/12 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div>
        {/* Folio Metadata Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-bold text-fantasy-sky bg-fantasy-sky/15 px-3 py-1 rounded-full border border-fantasy-sky/30 tracking-wider">
              ESTACIÓN {roman}
            </span>
            <span className="font-display text-[10px] font-bold uppercase text-fantasy-pink tracking-widest">
              DISTRITO {term.number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-display text-[10px] text-slate-300 bg-[#0b1320]/80 px-2.5 py-1 rounded-full border border-white/[0.06]">
              <Clock className="w-3 h-3 text-fantasy-ochre" />
              <span>{term.estimatedWeeks} SEMANAS</span>
            </span>

            {isGraduated ? (
              <span className="flex items-center gap-1 font-display text-[10px] font-bold text-fantasy-butter bg-fantasy-ochre/25 border border-fantasy-ochre/40 px-2.5 py-1 rounded-full shadow-sm">
                <Award className="w-3 h-3 text-fantasy-ochre" />
                <span>CONQUISTADO</span>
              </span>
            ) : progressPercent >= 100 ? (
              <span className="flex items-center gap-1 font-display text-[10px] font-bold text-fantasy-lime bg-fantasy-lime/15 border border-fantasy-lime/30 px-2.5 py-1 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>LISTO</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Display Title with Fredoka Polish */}
        <h3 className="font-display font-black text-2xl sm:text-[26px] text-white tracking-tight group-hover:text-fantasy-skyLight transition-colors leading-snug">
          {term.title}
        </h3>
        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed font-sans font-medium">
          {term.subtitle}
        </p>

        {/* Progress Bar with Soft Colors */}
        <div className="mt-5 bg-[#0b1320]/90 p-3.5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between font-display text-[11px] mb-2 font-bold">
            <span className="text-slate-400 tracking-wider">PROGRESO DEL MÓDULO</span>
            <span className="text-fantasy-sky">{progressPercent}%</span>
          </div>

          <div className="relative w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-lime"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-display text-[10px] font-bold text-slate-400 mt-2.5 pt-2 border-t border-white/[0.04]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-fantasy-lime" />
              {completedChecks}/{totalChecks} checks listos
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-fantasy-pink" />
              {attachedImagesCount} dibujos adjuntos
            </span>
          </div>
        </div>

        {/* 3 Units Plates */}
        <div className="mt-4 space-y-2">
          {term.units.map((unit) => {
            const unitChecks = unit.checks;
            const unitCompleted = unitChecks.filter((c) => checkStates[c.id]?.completed).length;
            const unitDone = unitCompleted === unitChecks.length && unitChecks.length > 0;

            return (
              <div
                key={unit.id}
                className="flex items-center justify-between bg-[#0b1320]/60 hover:bg-[#0b1320] px-3.5 py-2.5 rounded-2xl border border-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-display text-[10px] font-bold text-fantasy-ochre">
                    U.{unit.number}
                  </span>
                  <span className="text-xs text-slate-200 truncate font-medium">
                    {unit.title}
                  </span>
                </div>
                <span className={`font-display text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  unitDone 
                    ? 'bg-fantasy-lime/20 text-fantasy-lime border border-fantasy-lime/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {unitCompleted}/{unitChecks.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onSelectTerm(term)}
          className="flex-1 bg-[#16243d] hover:bg-[#1d3052] text-white font-display text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-fantasy-sky/30 hover:border-fantasy-sky/60 shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-fantasy-sky" />
          <span>EXPLORAR LECCIÓN</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {canGraduated && (
          <button
            type="button"
            onClick={() => onOpenGraduation(term)}
            className={`py-3 px-4 rounded-2xl font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isGraduated
                ? 'bg-fantasy-ochre/20 text-fantasy-ochre border border-fantasy-ochre/40 hover:bg-fantasy-ochre/30'
                : 'bg-gradient-to-r from-fantasy-ochre to-fantasy-pink text-slate-950 shadow-fantasy-ochre/25 hover:scale-105'
            }`}
            title={isGraduated ? 'Ver obra de graduación' : 'Subir obra para graduar término'}
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{isGraduated ? 'Ver Obra' : 'Graduar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
