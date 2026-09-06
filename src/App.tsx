import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Columns3, 
  Flame,
  Cloud 
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
import { BackupSyncModal } from './components/BackupSyncModal';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [milestones, setMilestones] = useState<MilestoneArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Backup & Sync with proprietary sync code and JSON state
  const [isBackupSyncOpen, setIsBackupSyncOpen] = useState(false);
  const [backupSyncTab, setBackupSyncTab] = useState<'import' | 'export'>('import');

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

  const [initialSyncCode, setInitialSyncCode] = useState<string>('');

  useEffect(() => {
    loadInitialData();

    // Check for sync code in URL params (?sync=... or ?code=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const syncParam = params.get('sync') || params.get('code') || params.get('import');
      if (syncParam) {
        setInitialSyncCode(syncParam);
        setBackupSyncTab('import');
        setIsBackupSyncOpen(true);
      }
    } catch {
      // Safe fallback
    }
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
    <div className="min-h-screen bg-[#0d1017] text-slate-200 flex flex-col pb-20 md:pb-8">
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
        onOpenBackupSync={(tab) => {
          setBackupSyncTab(tab || 'import');
          setIsBackupSyncOpen(true);
        }}
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
                {/* Editorial Artbook Masthead Banner */}
                <div className="relative bg-[#121622]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-atelier-ochre/[0.04] blur-3xl pointer-events-none rounded-full" />

                  {/* Top Monograph Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-white/[0.08] font-mono text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.22em] text-slate-400 uppercase">
                    <span className="flex items-center gap-1.5 text-fantasy-pink font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      MONOGRAFÍA DIDÁCTICA // VOL. 01
                    </span>
                    <span className="hidden md:inline text-slate-500">
                      CURRÍCULUM DEL ARTISTA AUTODIDACTA // ALEX HUNEYCUTT
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-fantasy-skyLight">
                      EDICIÓN IN WITCH
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
                    {/* Left Column: Grand Editorial Typography */}
                    <div className="lg:col-span-7">
                      <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-fantasy-sky mb-2">
                        <span>PLAN DE FORMACIÓN RIGUROSO // 9 FOLIOS</span>
                      </div>

                      <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-[72px] xl:text-[76px] text-white tracking-tight leading-[1.02] sm:leading-[0.92]">
                        El Camino del Artista
                      </h1>

                      <p className="text-xs sm:text-[15px] text-slate-200 mt-3 sm:mt-4 leading-relaxed font-sans font-normal max-w-xl">
                        <span className="float-left text-4xl sm:text-5xl lg:text-6xl font-serif italic text-fantasy-sky leading-none pr-2.5 sm:pr-3 pt-0.5 sm:pt-1">E</span>
                        ste compendio reúne los 9 folios de estudio progresivo adaptados de la legendaria metodología autodidacta de Alex Huneycutt. Diseñado para desarmar la parálisis del lienzo en blanco mediante dibujo gestual cronometrado, perspectiva estructural, anatomía sólida y dominio lumínico.
                      </p>

                      {/* Editorial Actions */}
                      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/[0.08]">
                        {(!profile || !profile.baselineArtwork) && (
                          <button
                            onClick={() => setIsOnboardingOpen(true)}
                            className="btn-atelier-primary px-5 py-3"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>REGISTRAR HITO CERO (NIVEL 0)</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setBackupSyncTab('import');
                            setIsBackupSyncOpen(true);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a101d] hover:bg-[#121c30] text-white font-mono text-xs uppercase tracking-wider border border-white/[0.1] hover:border-fantasy-pink/40 transition-all shadow-sm"
                          title="Importar o exportar datos vía código de sincronización y JSON"
                        >
                          <Cloud className="w-4 h-4 text-fantasy-pink" />
                          <span>SINCRONIZAR / RESPALDO</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('evolution')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a101d] hover:bg-[#121c30] text-white font-mono text-xs uppercase tracking-wider border border-white/[0.1] hover:border-fantasy-sky/40 transition-all shadow-sm"
                        >
                          <Columns3 className="w-4 h-4 text-fantasy-sky" />
                          <span>ESTUDIO ANTES / DESPUÉS</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('timer')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a101d] hover:bg-[#121c30] text-white font-mono text-xs uppercase tracking-wider border border-white/[0.1] hover:border-fantasy-ochre/40 transition-all shadow-sm"
                        >
                          <Flame className="w-4 h-4 text-fantasy-ochre" />
                          <span>CRONÓMETRO GESTUAL</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Featured Exhibition Plate with Client Reference Artwork */}
                    <div className="lg:col-span-5">
                      <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-[#070b14] shadow-2xl p-2.5 sm:p-3">
                        <div className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-[16/10] sm:aspect-[4/3] bg-slate-950">
                          <img 
                            src="./client_reference_art.jpg" 
                            alt="In Witch: Local Fantasy por Luna Bear" 
                            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/client_reference_art.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                          {/* Progress Badge overlay on top corner */}
                          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/[0.15] font-mono text-[9px] sm:text-[10px] text-white flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-fantasy-lime animate-ping" />
                            <span>{progressPercent}% AVANCE</span>
                          </div>

                          {/* Plate label overlay */}
                          <div className="absolute bottom-2.5 left-3 right-3 text-white">
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-fantasy-pink font-semibold">
                              PLACA N° 01 // REFERENCIA ESTILÍSTICA
                            </p>
                            <p className="font-serif italic text-base sm:text-lg text-white font-normal leading-tight truncate">
                              "In Witch — Local Fantasy" · Luna Bear
                            </p>
                          </div>
                        </div>

                        {/* Curatorial Plaque below image */}
                        <div className="mt-2.5 sm:mt-3 p-2.5 sm:p-3 bg-[#0a101d] rounded-xl border border-white/[0.06] flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest truncate">
                              PROGRESO GLOBAL DEL ATELIER
                            </p>
                            <p className="font-mono text-[11px] sm:text-xs text-white font-bold mt-0.5">
                              {completedChecksCount} / {TOTAL_CHECKS_COUNT} checks validados
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#5bb2f6] border border-white/20" title="Cielo Cerúleo" />
                            <span className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#ff8fb4] border border-white/20" title="Rosa Mágico" />
                            <span className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#f29f38] border border-white/20" title="Ocre Solar" />
                            <span className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#88dc65] border border-white/20" title="Verde Hoja" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar with Editorial Roman Numeral Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Search bar */}
                  <div className="relative w-full sm:w-80 flex-shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar temas, conceptos o ejercicios (Loomis, Drawabox, anatomía)..."
                      className="w-full bg-[#0e1626]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder-slate-400 focus:outline-none focus:border-fantasy-sky transition-colors shadow-sm"
                    />
                  </div>

                  {/* Roman Numeral Station Tabs with Smooth Horizontal Swipe on Mobile */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto pb-1 sm:pb-0 bg-[#0a101d] p-1.5 rounded-xl border border-white/[0.08]">
                    <button
                      onClick={() => setTermFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                        termFilter === 'all'
                          ? 'bg-[#1c2233] text-white border border-atelier-ochre/40 shadow-sm font-semibold'
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
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                            termFilter === num
                              ? 'bg-[#1c2233] text-white border border-atelier-ochre/40 shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          FOLIO {roman}
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
            onClose={() => setActiveTab('roadmap')}
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

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setIsOnboardingOpen(false);
            loadInitialData();
          }}
          openCanvasForBaseline={handleOpenCanvasForBaseline}
          temporaryCanvasImage={tempCanvasImage}
          onOpenBackupSync={(tab) => {
            setBackupSyncTab(tab || 'import');
            setIsBackupSyncOpen(true);
          }}
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
          onOpenBackupSync={(tab) => {
            setIsSettingsOpen(false);
            setBackupSyncTab(tab || 'import');
            setIsBackupSyncOpen(true);
          }}
        />
      )}

      {/* Backup / Sync Modal (código propietario + JSON) */}
      <BackupSyncModal
        isOpen={isBackupSyncOpen}
        initialTab={backupSyncTab}
        initialCode={initialSyncCode}
        onClose={() => {
          setIsBackupSyncOpen(false);
          setInitialSyncCode('');
        }}
        onDataRestored={() => {
          loadInitialData();
          setIsOnboardingOpen(false);
          setIsBackupSyncOpen(false);
          setInitialSyncCode('');
        }}
      />
    </div>
  );
};

export default App;
