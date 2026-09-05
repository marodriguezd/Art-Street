import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  ExternalLink, 
  PlayCircle, 
  Book, 
  Sparkles, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { Term, Unit, CheckItem, CheckState } from '../types/curriculum';
import { CheckItemRow } from './CheckItemRow';

interface UnitViewProps {
  term: Term;
  unit: Unit;
  checkStates: Record<string, CheckState>;
  onBack: () => void;
  onSelectUnit: (unit: Unit) => void;
  onToggleCheck: (checkId: string) => void;
  onOpenProofModal: (check: CheckItem) => void;
  onOpenSketchpad: (check: CheckItem) => void;
  onOpenGraduation: (term: Term) => void;
}

export const UnitView: React.FC<UnitViewProps> = ({
  term,
  unit,
  checkStates,
  onBack,
  onSelectUnit,
  onToggleCheck,
  onOpenProofModal,
  onOpenSketchpad,
  onOpenGraduation,
}) => {
  const [activeTab, setActiveTab] = useState<'checks' | 'resources'>('checks');

  // Stats for this unit
  const totalChecks = unit.checks.length;
  const completedChecks = unit.checks.filter((c) => checkStates[c.id]?.completed).length;
  const unitProgress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto py-3 sm:py-4 px-2 sm:px-4">
      {/* Back Button and Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-display font-bold text-slate-300 hover:text-white bg-[#111c30] hover:bg-[#16243d] px-4 py-2.5 rounded-2xl border border-white/[0.08] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Camino</span>
        </button>

        {/* Unit Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-[#111c30]/90 p-1.5 rounded-2xl border border-white/[0.08] shadow-inner overflow-x-auto no-scrollbar">
          {term.units.map((u) => {
            const isSelected = u.id === unit.id;
            const uCompleted = u.checks.filter((c) => checkStates[c.id]?.completed).length;
            const uDone = uCompleted === u.checks.length && u.checks.length > 0;

            return (
              <button
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>MÓD.{u.number}</span>
                {uDone && <CheckCircle2 className="w-3.5 h-3.5 text-fantasy-lime" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Banner */}
      <div className="bg-[#0e1626]/90 backdrop-blur-2xl border border-white/[0.09] rounded-2xl p-4 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden mb-6 sm:mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-fantasy-sky/15 to-fantasy-pink/12 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 sm:mb-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-fantasy-sky bg-fantasy-sky/15 px-2.5 sm:px-3 py-1 rounded-full border border-fantasy-sky/30">
              FOLIO 0{term.number} // MÓDULO {unit.number}
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-300 bg-[#070b14] px-2.5 sm:px-3 py-1 rounded-full border border-white/[0.06]">
              4 SEMANAS ESTIMADAS
            </span>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px]">
            <span className="text-slate-300">
              {completedChecks} / {totalChecks} pliegos
            </span>
            <span className="font-bold text-fantasy-lime bg-[#070b14] px-2.5 sm:px-3 py-1 rounded-full border border-white/[0.06]">
              {unitProgress}%
            </span>
          </div>
        </div>

        <h2 className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
          {unit.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-2.5 sm:mt-3 leading-relaxed max-w-3xl font-sans font-normal">
          {unit.description}
        </p>

        {/* Subtitle / Challenge brief if any */}
        {unit.subtitle && (
          <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl bg-[#070b14]/80 border border-white/[0.06] flex items-start gap-2.5 sm:gap-3 text-xs text-slate-200">
            <Sparkles className="w-4 h-4 text-fantasy-ochre flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-fantasy-ochre uppercase tracking-wider">OBJETIVO TÉCNICO: </span>
              <span className="font-sans">{unit.subtitle}</span>
            </div>
          </div>
        )}

        {/* Tab switch inside Unit */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/[0.06]">
          <button
            onClick={() => setActiveTab('checks')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'checks'
                ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                : 'bg-[#070b14] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>EJERCICIOS Y PRUEBAS ({totalChecks})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'resources'
                ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                : 'bg-[#070b14] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>BIBLIOGRAFÍA Y RECURSOS ({unit.resources.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === 'checks' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-studio-400 px-1 mb-1">
            <span>Haz clic en cada check al completar tu sesión y adjunta tu foto o dibujo</span>
            <span className="text-orange-400 font-bold">+50 XP por cada ejercicio</span>
          </div>

          {unit.checks.map((check) => (
            <CheckItemRow
              key={check.id}
              check={check}
              state={checkStates[check.id]}
              onToggleCheck={onToggleCheck}
              onOpenProofModal={onOpenProofModal}
              onOpenSketchpad={onOpenSketchpad}
            />
          ))}

          {/* Unit Completion Celebration / Graduation Callout */}
          {unitProgress === 100 && (
            <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-studio-900 to-studio-900 border border-emerald-500/40 text-center shadow-xl">
              <span className="text-3xl">🎉</span>
              <h3 className="font-display font-black text-xl text-white mt-2">
                ¡Has completado todos los ejercicios de la Unidad {unit.number}!
              </h3>
              <p className="text-xs text-studio-300 mt-1 max-w-md mx-auto">
                Tu técnica y memoria muscular se han fortalecido. Continúa a la siguiente unidad o prepara tu obra de graduación del Término {term.number}.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenGraduation(term)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all"
                >
                  Entregar Obra de Graduación del Término
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Resources List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unit.resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-studio-900 hover:bg-studio-850 border border-studio-800 hover:border-studio-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-studio-400">
                      {res.type === 'youtube' ? (
                        <PlayCircle className="w-4 h-4 text-red-500" />
                      ) : res.type === 'book' ? (
                        <Book className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Layers className="w-4 h-4 text-cyan-400" />
                      )}
                      <span className="capitalize">{res.type}</span>
                    </span>

                    {res.isFree ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Gratis
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-studio-400 bg-studio-950 px-2 py-0.5 rounded-full border border-studio-800">
                        Referencia
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-xs text-studio-400 mt-1">
                    {res.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-studio-800/60 flex items-center justify-between text-xs text-orange-400 font-semibold">
                  <span>Abrir recurso</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
