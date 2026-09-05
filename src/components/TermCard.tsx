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
    <div className="group relative bg-atelier-900/60 hover:bg-atelier-900/90 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 shadow-[0_16px_36px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(234,88,12,0.12)] flex flex-col justify-between overflow-hidden drafting-corner">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div>
        {/* Folio Metadata Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 tracking-wider">
              FOLIO {roman}
            </span>
            <span className="font-mono text-[10px] uppercase text-atelier-400 tracking-widest">
              ACADÉMICO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[10px] text-atelier-300 bg-atelier-950/80 px-2.5 py-1 rounded-lg border border-white/[0.06]">
              <Clock className="w-3 h-3 text-orange-400/80" />
              <span>{term.estimatedWeeks}W</span>
            </span>

            {isGraduated ? (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg shadow-sm">
                <Award className="w-3 h-3 text-amber-400" />
                <span>GRADUADO</span>
              </span>
            ) : progressPercent >= 100 ? (
              <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>LISTO</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Serif Title with Editorial Polish */}
        <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight group-hover:text-amber-200 transition-colors leading-snug">
          {term.title}
        </h3>
        <p className="text-xs text-atelier-400 mt-2 line-clamp-2 leading-relaxed font-sans font-light">
          {term.subtitle}
        </p>

        {/* Drafting Progress Bar with Millimeter Scale Marks */}
        <div className="mt-5 bg-atelier-950/90 p-3.5 rounded-2xl border border-white/[0.06]">
          <div className="flex items-center justify-between font-mono text-[11px] mb-2">
            <span className="text-atelier-400 tracking-wider">PROGRESO DEL FOLIO</span>
            <span className="text-orange-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="relative w-full bg-atelier-800/80 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-atelier-400 mt-2.5 pt-2 border-t border-white/[0.04]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-orange-400/80" />
              {completedChecks}/{totalChecks} checks
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-amber-400/80" />
              {attachedImagesCount} pruebas
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
                className="flex items-center justify-between bg-atelier-950/60 hover:bg-atelier-950 px-3 py-2.5 rounded-xl border border-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-[10px] font-bold text-orange-400/80">
                    MOD.{unit.number}
                  </span>
                  <span className="text-xs text-slate-200 truncate font-medium">
                    {unit.title}
                  </span>
                </div>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  unitDone 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-atelier-800 text-atelier-400'
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
          className="flex-1 bg-atelier-800/80 hover:bg-atelier-750 text-white font-mono text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/[0.06] hover:border-white/20 shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-orange-400" />
          <span>ESTUDIAR LECCIONES</span>
          <ChevronRight className="w-3.5 h-3.5 text-atelier-400" />
        </button>

        <button
          type="button"
          onClick={() => onOpenGraduation(term)}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
            isGraduated
              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 shadow-sm'
              : canGraduated
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-terracotta text-white shadow-lg shadow-orange-500/25 hover:brightness-110'
              : 'bg-atelier-950 text-atelier-500 hover:text-atelier-300 border border-white/[0.06]'
          }`}
          title={isGraduated ? 'Ver obra de graduación' : 'Entregar obra de graduación'}
        >
          <Award className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isGraduated ? 'OBRA ENTREGADA' : 'GRADUAR'}</span>
        </button>
      </div>
    </div>
  );
};
