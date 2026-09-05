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
  // Compute progress for this term
  const allTermChecks = term.units.flatMap((u) => u.checks);
  const totalChecks = allTermChecks.length;
  const completedChecks = allTermChecks.filter((c) => checkStates[c.id]?.completed).length;
  const progressPercent = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  // Attached proof images count
  const attachedImagesCount = allTermChecks.reduce((acc, c) => {
    return acc + (checkStates[c.id]?.images?.length || 0);
  }, 0);

  // Is graduated?
  const graduationArtwork = milestones.find((m) => m.termNumber === term.number);
  const isGraduated = !!graduationArtwork;
  const canGraduated = progressPercent >= 80 || isGraduated;

  return (
    <div className="group relative bg-studio-900/90 hover:bg-studio-900 border border-studio-800 hover:border-studio-700 rounded-3xl p-5 sm:p-6 transition-all duration-300 shadow-xl shadow-black/40 flex flex-col justify-between overflow-hidden">
      {/* Subtle background glow based on term */}
      <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${term.color} opacity-5 blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity`} />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-display font-black text-sm flex items-center justify-center">
              {term.number}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-studio-400">
              Término {term.number}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-studio-400 bg-studio-950 px-2.5 py-1 rounded-lg border border-studio-800">
              <Clock className="w-3 h-3 text-studio-400" />
              <span>~{term.estimatedWeeks} sem</span>
            </span>

            {isGraduated ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                <Award className="w-3.5 h-3.5" />
                <span>Graduado</span>
              </span>
            ) : progressPercent >= 100 ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¡Listo para graduar!</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Title and Subtitle */}
        <h3 className="font-display font-extrabold text-lg sm:text-xl text-white tracking-tight group-hover:text-orange-400 transition-colors">
          {term.title}
        </h3>
        <p className="text-xs text-studio-400 mt-1 line-clamp-2">
          {term.subtitle}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 bg-studio-950 p-3 rounded-2xl border border-studio-800/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-studio-300">Progreso de ejercicios</span>
            <span className="text-orange-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-studio-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${term.color}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-studio-400 mt-2 pt-1.5 border-t border-studio-800/40">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-studio-500" />
              {completedChecks} de {totalChecks} checks listos
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-studio-500" />
              {attachedImagesCount} dibujos adjuntos
            </span>
          </div>
        </div>

        {/* 3 Units Preview */}
        <div className="mt-4 space-y-2">
          {term.units.map((unit) => {
            const unitChecks = unit.checks;
            const unitCompleted = unitChecks.filter((c) => checkStates[c.id]?.completed).length;
            const unitDone = unitCompleted === unitChecks.length && unitChecks.length > 0;

            return (
              <div
                key={unit.id}
                className="flex items-center justify-between bg-studio-950/60 hover:bg-studio-950 px-3 py-2 rounded-xl border border-studio-800/60 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-studio-500 font-bold text-[10px]">U{unit.number}</span>
                  <span className="text-studio-200 truncate font-medium">{unit.title}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  unitDone 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-studio-800 text-studio-400'
                }`}>
                  {unitCompleted}/{unitChecks.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-studio-800/60 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectTerm(term)}
          className="flex-1 bg-studio-800 hover:bg-studio-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-orange-400" />
          <span>Ver Lecciones</span>
          <ChevronRight className="w-3.5 h-3.5 text-studio-400" />
        </button>

        <button
          type="button"
          onClick={() => onOpenGraduation(term)}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            isGraduated
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
              : canGraduated
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:brightness-110'
              : 'bg-studio-950 text-studio-500 hover:text-studio-300 border border-studio-800'
          }`}
          title={isGraduated ? 'Ver obra de graduación' : 'Entregar obra de graduación'}
        >
          <Award className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isGraduated ? 'Obra Entregada' : 'Graduación'}</span>
        </button>
      </div>
    </div>
  );
};
