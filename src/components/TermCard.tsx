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
    <div className="group relative bg-[#0e1626]/90 hover:bg-[#121c30] backdrop-blur-xl border border-white/[0.09] hover:border-fantasy-sky/40 rounded-2xl p-6 transition-all duration-300 shadow-[0_16px_40px_rgba(5,9,16,0.65)] hover:shadow-[0_20px_48px_rgba(91,178,246,0.12)] flex flex-col justify-between overflow-hidden">
      {/* Subtle ambient spotlight */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-fantasy-sky/15 via-fantasy-pink/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div>
        {/* Folio Metadata Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="font-serif italic text-2xl text-fantasy-sky font-normal">
              Folio {roman}
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06]">
              CAPÍTULO 0{term.number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] text-slate-300 bg-[#070b14] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              <Clock className="w-3 h-3 text-fantasy-ochre" />
              <span>{term.estimatedWeeks} SEM</span>
            </span>

            {isGraduated ? (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-fantasy-ochre bg-fantasy-ochre/15 border border-fantasy-ochre/30 px-2.5 py-1 rounded-lg">
                <Award className="w-3 h-3" />
                <span>GRADUADO</span>
              </span>
            ) : progressPercent >= 100 ? (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-fantasy-lime bg-fantasy-lime/15 border border-fantasy-lime/30 px-2.5 py-1 rounded-lg">
                <Sparkles className="w-3 h-3" />
                <span>LISTO</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Display Title with Editorial Serif */}
        <h3 className="font-serif italic text-2xl sm:text-[27px] text-white tracking-tight group-hover:text-fantasy-skyLight transition-colors leading-tight mt-1">
          {term.title}
        </h3>
        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed font-sans font-normal">
          {term.subtitle}
        </p>

        {/* Progress Bar with Fine Lines */}
        <div className="mt-5 bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06]">
          <div className="flex items-center justify-between font-mono text-[10px] mb-2 font-medium">
            <span className="text-slate-400 tracking-wider uppercase">Avance del Folio</span>
            <span className="text-fantasy-sky font-bold">{progressPercent}%</span>
          </div>

          <div className="relative w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-lime"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.04]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-fantasy-lime" />
              {completedChecks}/{totalChecks} checks
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-fantasy-pink" />
              {attachedImagesCount} pruebas
            </span>
          </div>
        </div>

        {/* 3 Units Plates */}
        <div className="mt-4 space-y-1.5">
          {term.units.map((unit) => {
            const unitChecks = unit.checks;
            const unitCompleted = unitChecks.filter((c) => checkStates[c.id]?.completed).length;
            const unitDone = unitCompleted === unitChecks.length && unitChecks.length > 0;

            return (
              <div
                key={unit.id}
                className="flex items-center justify-between bg-[#070b14]/70 hover:bg-[#0a101d] px-3 py-2 rounded-xl border border-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-fantasy-sky font-semibold">
                    § {unit.number}
                  </span>
                  <span className="text-xs text-slate-200 truncate font-sans">
                    {unit.title}
                  </span>
                </div>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${
                  unitDone 
                    ? 'bg-fantasy-lime/20 text-fantasy-lime border border-fantasy-lime/30' 
                    : 'bg-slate-850 text-slate-400'
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
          className="flex-1 bg-[#121c30] hover:bg-[#182642] text-white font-mono text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-fantasy-sky/30 hover:border-fantasy-sky/60 shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-fantasy-sky" />
          <span>ABRIR FOLIO</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {canGraduated && (
          <button
            type="button"
            onClick={() => onOpenGraduation(term)}
            className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              isGraduated
                ? 'bg-fantasy-ochre/20 text-fantasy-ochre border border-fantasy-ochre/40 hover:bg-fantasy-ochre/30'
                : 'bg-gradient-to-r from-fantasy-ochre to-fantasy-pink text-slate-950 shadow-fantasy-ochre/25 hover:scale-105'
            }`}
            title={isGraduated ? 'Ver obra de graduación' : 'Subir obra para graduar término'}
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{isGraduated ? 'Obra' : 'Graduar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
