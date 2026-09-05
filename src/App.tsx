import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Columns3, 
  Award, 
  Flame 
} from 'lucide-react';
import { 
  CURRICULUM_TERMS, 
  TOTAL_CHECKS_COUNT,
  getTermById 
} from './data/curriculumData';
import { 
  UserProfile, 
  Term, 
  Unit, 
  CheckItem, 
  CheckState, 
  MilestoneArtwork 
} from './types/curriculum';
import { 
  getProfile, 
  getAllCheckStates, 
  getMilestones, 
  saveCheckState, 
  saveProfile 
} from './services/storage';

// Components
import { Navbar } from './components/Navbar';
import { TermCard } from './components/TermCard';
import { UnitView } from './components/UnitView';
import { OnboardingModal } from './components/OnboardingModal';
import { ProofUploadModal } from './components/ProofUploadModal';
import { SketchpadModal } from './components/SketchpadModal';
import { GestureTimerModal } from './components/GestureTimerModal';
import { GraduationModal } from './components/GraduationModal';
import { EvolutionStudio } from './components/EvolutionStudio';
import { SettingsBackupModal } from './components/SettingsBackupModal';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [milestones, setMilestones] = useState<MilestoneArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation and active views
  const [activeTab, setActiveTab] = useState<'roadmap' | 'evolution' | 'timer' | 'canvas' | 'settings'>('roadmap');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState<number | 'all'>('all');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [proofModalCheck, setProofModalCheck] = useState<CheckItem | null>(null);
  const [sketchpadCheck, setSketchpadCheck] = useState<CheckItem | null>(null);
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [graduationTerm, setGraduationTerm] = useState<Term | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Temporary canvas image for onboarding baseline
  const [tempCanvasImage, setTempCanvasImage] = useState<string | null>(null);
  const [canvasTargetMode, setCanvasTargetMode] = useState<'proof' | 'baseline' | 'standalone'>('standalone');

  // Load Initial Data from IndexedDB
  const loadInitialData = async () => {
    try {
      const [savedProfile, savedChecks, savedMilestones] = await Promise.all([
        getProfile(),
        getAllCheckStates(),
        getMilestones(),
      ]);

      setProfile(savedProfile);
      setCheckStates(savedChecks);
      setMilestones(savedMilestones);

      // Open onboarding if no profile exists
      if (!savedProfile || !savedProfile.baselineArtwork) {
        setIsOnboardingOpen(true);
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Compute Overall Progress
  const completedChecksCount = useMemo(() => {
    return Object.values(checkStates).filter((c) => c.completed).length;
  }, [checkStates]);

  const progressPercent = useMemo(() => {
    return TOTAL_CHECKS_COUNT > 0 ? Math.round((completedChecksCount / TOTAL_CHECKS_COUNT) * 100) : 0;
  }, [completedChecksCount]);

  // Handle Toggle Check
  const handleToggleCheck = async (checkId: string) => {
    const currentState = checkStates[checkId];
    const isNowCompleted = !currentState?.completed;

    const updatedState: CheckState = {
      checkId,
      completed: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      images: currentState?.images || [],
      notes: currentState?.notes,
    };

    const newCheckStates = { ...checkStates, [checkId]: updatedState };
    setCheckStates(newCheckStates);
    await saveCheckState(updatedState);

    // Award XP and update profile
    if (profile) {
      const xpDelta = isNowCompleted ? 50 : -50;
      const updatedProfile: UserProfile = {
        ...profile,
        xp: Math.max(0, profile.xp + xpDelta),
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
  };

  // Handle Save Check State with proof images
  const handleSaveCheckState = async (updated: CheckState) => {
    const newCheckStates = { ...checkStates, [updated.checkId]: updated };
    setCheckStates(newCheckStates);
    await saveCheckState(updated);

    if (profile && updated.completed && !checkStates[updated.checkId]?.completed) {
      const updatedProfile: UserProfile = {
        ...profile,
        xp: profile.xp + 50,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
  };

  // Open Canvas for baseline artwork in onboarding
  const handleOpenCanvasForBaseline = () => {
    setCanvasTargetMode('baseline');
    setIsCanvasModalOpen(true);
  };

  // Open Canvas for a specific check
  const handleOpenSketchpadForCheck = (check: CheckItem) => {
    setSketchpadCheck(check);
    setCanvasTargetMode('proof');
    setIsCanvasModalOpen(true);
  };

  // Handle Save from Canvas
  const handleSaveSketch = async (dataUrl: string, note?: string) => {
    if (canvasTargetMode === 'baseline') {
      setTempCanvasImage(dataUrl);
    } else if (canvasTargetMode === 'proof' && sketchpadCheck) {
      const current = checkStates[sketchpadCheck.id];
      const newImg = {
        id: 'proof_' + Date.now(),
        dataUrl,
        timestamp: new Date().toISOString(),
        note: note || 'Boceto realizado en el lienzo integrado',
      };
      const updatedImages = [newImg, ...(current?.images || [])];
      await handleSaveCheckState({
        checkId: sketchpadCheck.id,
        completed: true,
        completedAt: current?.completedAt || new Date().toISOString(),
        images: updatedImages,
        notes: current?.notes,
      });
    }
    setSketchpadCheck(null);
  };

  // Handle Graduation Completed
  const handleGraduationComplete = async (artwork: MilestoneArtwork) => {
    const existing = milestones.filter((m) => m.id !== artwork.id);
    const updated = [...existing, artwork].sort((a, b) => a.termNumber - b.termNumber);
    setMilestones(updated);

    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        xp: profile.xp + 500, // Graduation major XP
      };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
  };

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return CURRICULUM_TERMS.filter((term) => {
      if (termFilter !== 'all' && term.number !== termFilter) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const inTerm = term.title.toLowerCase().includes(q) || term.description.toLowerCase().includes(q);
      const inUnits = term.units.some(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.checks.some((c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q)))
      );
      return inTerm || inUnits;
    });
  }, [termFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-studio-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center animate-spin text-2xl mb-4">
          🎨
        </div>
        <p className="font-display font-black text-xl tracking-tight">Cargando Art Street...</p>
        <p className="text-xs text-studio-400 mt-1">Sincronizando el camino del artista autodidacta</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-studio-950 text-slate-100 flex flex-col pb-20 md:pb-8">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
            if (tab === 'roadmap') {
              setSelectedTerm(null);
              setSelectedUnit(null);
            }
          }
        }}
        completedChecksCount={completedChecksCount}
        totalChecksCount={TOTAL_CHECKS_COUNT}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <>
            {/* If drilling into a unit view */}
            {selectedTerm && selectedUnit ? (
              <UnitView
                term={selectedTerm}
                unit={selectedUnit}
                checkStates={checkStates}
                onBack={() => {
                  setSelectedUnit(null);
                  setSelectedTerm(null);
                }}
                onSelectUnit={(u) => setSelectedUnit(u)}
                onToggleCheck={handleToggleCheck}
                onOpenProofModal={(c) => setProofModalCheck(c)}
                onOpenSketchpad={handleOpenSketchpadForCheck}
                onOpenGraduation={(t) => setGraduationTerm(t)}
              />
            ) : (
              /* Roadmap Main Overview */
              <div>
                {/* Local Fantasy Hero Banner */}
                <div className="relative bg-gradient-to-br from-[#111c30]/95 via-[#14233c]/90 to-[#161d2d]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-fantasy-sky/20 via-fantasy-pink/15 to-transparent blur-3xl pointer-events-none rounded-full" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fantasy-pink/15 border border-fantasy-pink/30 text-fantasy-pink font-display font-bold text-xs uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>LOCAL FANTASY // EL CAMINO DEL ARTISTA</span>
                      </div>

                      <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05]">
                        El Camino del Artista
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-200 mt-3 max-w-2xl leading-relaxed font-sans font-medium">
                        ¡Bienvenido a la aventura, <strong>{profile?.name || 'Artista'}</strong>! Recorre las <strong>9 Estaciones</strong> y <strong>27 Módulos</strong> del currículum de RadioRunner. Practica a tu ritmo, guarda tus dibujos de prueba y gradúate en cada estación para ver tu salto técnico.
                      </p>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/[0.06] text-xs font-display">
                        <button
                          onClick={() => setActiveTab('evolution')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#16243d] hover:bg-[#1d3052] text-white font-bold border border-fantasy-sky/30 hover:border-fantasy-sky/60 transition-all shadow-sm"
                        >
                          <Columns3 className="w-4 h-4 text-fantasy-sky" />
                          <span>COMPARADOR ANTES / DESPUÉS</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('timer')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#16243d] hover:bg-[#1d3052] text-white font-bold border border-fantasy-ochre/30 hover:border-fantasy-ochre/60 transition-all shadow-sm"
                        >
                          <Flame className="w-4 h-4 text-fantasy-ochre" />
                          <span>GIMNASIO DE GESTOS RÁPIDOS</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Gauge */}
                    <div className="lg:col-span-4 bg-[#0b1320]/90 p-6 rounded-3xl border border-white/[0.08] flex items-center gap-5 shadow-inner">
                      <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800 stroke-current"
                            strokeWidth="3.5"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-fantasy-sky stroke-current transition-all duration-1000 ease-out"
                            strokeWidth="3.5"
                            strokeDasharray={`${progressPercent}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="font-display font-black text-xl text-white">
                            {progressPercent}%
                          </span>
                          <span className="font-display text-[9px] text-fantasy-skyLight/80 uppercase font-bold tracking-tight">
                            AVANCE
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="font-display text-[10px] font-bold text-fantasy-sky uppercase tracking-wider">
                          PROGRESO GLOBAL
                        </p>
                        <p className="font-display text-sm text-white font-bold mt-1">
                          {completedChecksCount} / {TOTAL_CHECKS_COUNT}
                          <span className="text-xs font-normal text-slate-400 ml-1">ejercicios</span>
                        </p>
                        <p className="font-display text-[11px] text-fantasy-ochre font-bold mt-1.5 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" />
                          <span>{milestones.length} obras registradas</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar with Storybook Station Tabs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  {/* Search bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por Loomis, Drawabox, anatomía..."
                      className="w-full bg-[#111c30]/90 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 font-display text-xs text-white placeholder-slate-400 focus:outline-none focus:border-fantasy-sky transition-colors shadow-sm"
                    />
                  </div>

                  {/* Roman Numeral Station Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 bg-[#111c30]/80 p-1.5 rounded-2xl border border-white/[0.06]">
                    <button
                      onClick={() => setTermFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl font-display text-xs font-bold transition-all whitespace-nowrap ${
                        termFilter === 'all'
                          ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      TODOS
                    </button>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'].map((roman, idx) => {
                      const num = idx + 1;
                      return (
                        <button
                          key={num}
                          onClick={() => setTermFilter(num)}
                          className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all whitespace-nowrap ${
                            termFilter === num
                              ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/20'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {roman}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid of 9 Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTerms.map((term) => (
                    <TermCard
                      key={term.id}
                      term={term}
                      checkStates={checkStates}
                      milestones={milestones}
                      onSelectTerm={(t) => {
                        setSelectedTerm(t);
                        setSelectedUnit(t.units[0]);
                      }}
                      onOpenGraduation={(t) => setGraduationTerm(t)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* EVOLUTION STUDIO TAB */}
        {activeTab === 'evolution' && (
          <EvolutionStudio
            profile={profile}
            milestones={milestones}
            onOpenGraduationForTerm={(termNum) => {
              const term = getTermById(termNum);
              if (term) setGraduationTerm(term);
            }}
          />
        )}

        {/* GESTURE TIMER TAB */}
        {activeTab === 'timer' && (
          <GestureTimerModal
            onOpenCanvas={() => {
              setCanvasTargetMode('standalone');
              setIsCanvasModalOpen(true);
            }}
          />
        )}

        {/* CANVAS DIRECT TAB */}
        {activeTab === 'canvas' && (
          <div className="py-2">
            <SketchpadModal
              check={null}
              onClose={() => setActiveTab('roadmap')}
              onSaveSketch={(_dataUrl, _note) => {
                alert('Boceto guardado.');
                setActiveTab('roadmap');
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setIsOnboardingOpen(false);
            loadInitialData();
          }}
          openCanvasForBaseline={handleOpenCanvasForBaseline}
          temporaryCanvasImage={tempCanvasImage}
        />
      )}

      {/* Proof Upload Modal */}
      {proofModalCheck && (
        <ProofUploadModal
          check={proofModalCheck}
          checkState={checkStates[proofModalCheck.id]}
          onClose={() => setProofModalCheck(null)}
          onSaveState={handleSaveCheckState}
          onOpenSketchpad={(c) => {
            setProofModalCheck(null);
            handleOpenSketchpadForCheck(c);
          }}
        />
      )}

      {/* Digital Canvas Modal */}
      {isCanvasModalOpen && (
        <SketchpadModal
          check={sketchpadCheck}
          onClose={() => {
            setIsCanvasModalOpen(false);
            setSketchpadCheck(null);
          }}
          onSaveSketch={handleSaveSketch}
        />
      )}

      {/* Graduation Modal */}
      {graduationTerm && (
        <GraduationModal
          term={graduationTerm}
          existingArtwork={milestones.find((m) => m.termNumber === graduationTerm.number)}
          onClose={() => setGraduationTerm(null)}
          onGraduated={handleGraduationComplete}
          onOpenCanvas={() => {
            setGraduationTerm(null);
            setCanvasTargetMode('standalone');
            setIsCanvasModalOpen(true);
          }}
          temporaryCanvasImage={tempCanvasImage}
          onGoToEvolution={() => {
            setGraduationTerm(null);
            setActiveTab('evolution');
          }}
        />
      )}

      {/* Settings & Backup Modal */}
      {isSettingsOpen && (
        <SettingsBackupModal
          profile={profile}
          onClose={() => setIsSettingsOpen(false)}
          onProfileUpdated={(updated) => setProfile(updated)}
          onDataReload={loadInitialData}
        />
      )}
    </div>
  );
};

export default App;
