import React from 'react';
import { 
  Compass, 
  Flame, 
  Timer, 
  Palette, 
  Settings, 
  Columns3, 
  Award
} from 'lucide-react';
import { UserProfile } from '../types/curriculum';

interface NavbarProps {
  profile: UserProfile | null;
  activeTab: 'roadmap' | 'evolution' | 'timer' | 'canvas' | 'settings';
  setActiveTab: (tab: 'roadmap' | 'evolution' | 'timer' | 'canvas' | 'settings') => void;
  completedChecksCount: number;
  totalChecksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  completedChecksCount,
  totalChecksCount,
}) => {
  const level = profile ? Math.floor(profile.xp / 250) + 1 : 1;
  const progressPercent = totalChecksCount > 0 ? Math.round((completedChecksCount / totalChecksCount) * 100) : 0;

  // Level rank title based on level
  const rankTitle = 
    level >= 10 ? 'Maestro Atelier' :
    level >= 7 ? 'Concept Designer' :
    level >= 5 ? 'Colorista Senior' :
    level >= 3 ? 'Escultor Anatómico' :
    'Draftsman Novicio';

  return (
    <>
      {/* Desktop & Tablet Top Bar */}
      <header className="sticky top-0 z-40 bg-atelier-950/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand with Editorial Atelier Identity */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group" 
            onClick={() => setActiveTab('roadmap')}
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-terracotta p-[1px] shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/35 transition-all">
              <div className="w-full h-full bg-atelier-900 rounded-2xl flex items-center justify-center">
                <span className="text-xl transform group-hover:scale-110 transition-transform">🎨</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-2xl font-normal tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Art Street
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25">
                  Atelier Solo
                </span>
              </div>
              <p className="font-mono text-[10px] text-atelier-400 tracking-wider hidden sm:block">
                RAD_RUNNER // 9 TÉRMINOS • 27 UNIDADES
              </p>
            </div>
          </div>

          {/* Center Navigation on Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-atelier-900/90 p-1.5 rounded-2xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-bold'
                  : 'text-atelier-400 hover:text-white hover:bg-atelier-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>01. CAMINO</span>
            </button>

            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
                activeTab === 'evolution'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-bold'
                  : 'text-atelier-400 hover:text-white hover:bg-atelier-800/60'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>02. EVOLUCIÓN</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-bold'
                  : 'text-atelier-400 hover:text-white hover:bg-atelier-800/60'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>03. GESTOS</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
                activeTab === 'canvas'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 font-bold'
                  : 'text-atelier-400 hover:text-white hover:bg-atelier-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>04. LIENZO</span>
            </button>
          </nav>

          {/* Right Stats & Profile */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-atelier-900/90 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{profile?.streakDays || 1}D RACHA</span>
            </div>

            {/* Level & XP */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-atelier-900/90 border border-white/[0.08] text-xs">
              <Award className="w-4 h-4 text-orange-400" />
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-bold text-white uppercase">{rankTitle}</span>
                  <span className="text-atelier-400">LVL {level}</span>
                </div>
                <div className="w-24 bg-atelier-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl border transition-all ${
                activeTab === 'settings'
                  ? 'bg-atelier-800 border-white/20 text-white'
                  : 'bg-atelier-900/80 border-white/[0.08] text-atelier-400 hover:text-white hover:border-white/20'
              }`}
              title="Ajustes y Respaldo"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-atelier-950/95 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'roadmap' ? 'text-orange-400 font-bold' : 'text-atelier-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Camino</span>
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'evolution' ? 'text-orange-400 font-bold' : 'text-atelier-400 hover:text-slate-200'
          }`}
        >
          <Columns3 className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Evolución</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'timer' ? 'text-orange-400 font-bold' : 'text-atelier-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Gestos</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'canvas' ? 'text-orange-400 font-bold' : 'text-atelier-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Lienzo</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'settings' ? 'text-orange-400 font-bold' : 'text-atelier-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Ajustes</span>
        </button>
      </nav>
    </>
  );
};
