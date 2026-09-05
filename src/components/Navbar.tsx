import React from 'react';
import { 
  Compass, 
  Flame, 
  Timer, 
  Palette, 
  Settings, 
  Columns3, 
  Trophy 
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

  return (
    <>
      {/* Desktop & Tablet Top Bar */}
      <header className="sticky top-0 z-40 bg-studio-950/85 backdrop-blur-md border-b border-studio-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('roadmap')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-xl">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-tight text-white">Art Street</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  El Camino
                </span>
              </div>
              <p className="text-xs text-studio-400 hidden sm:block">Solo Artist Curriculum • Reddit Edition</p>
            </div>
          </div>

          {/* Center Navigation on Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-studio-900/90 p-1.5 rounded-2xl border border-studio-800">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-studio-300 hover:text-white hover:bg-studio-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Camino</span>
            </button>

            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'evolution'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-studio-300 hover:text-white hover:bg-studio-800/60'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>Evolución</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'timer'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-studio-300 hover:text-white hover:bg-studio-800/60'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Gestos</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'canvas'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-studio-300 hover:text-white hover:bg-studio-800/60'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Lienzo</span>
            </button>
          </nav>

          {/* Right Stats & Profile */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-studio-900/80 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
              <span>{profile?.streakDays || 1}d racha</span>
            </div>

            {/* Level & XP */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-studio-900/80 border border-studio-800 text-xs">
              <Trophy className="w-4 h-4 text-orange-400" />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>Nivel {level}</span>
                  <span className="text-[10px] text-studio-400">({profile?.xp || 0} XP)</span>
                </div>
                <div className="w-20 bg-studio-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
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
                  ? 'bg-studio-800 border-studio-600 text-white'
                  : 'bg-studio-900/80 border-studio-800 text-studio-400 hover:text-white hover:border-studio-700'
              }`}
              title="Ajustes y Respaldo"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-studio-950/95 backdrop-blur-lg border-t border-studio-800/80 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'roadmap' ? 'text-orange-400 font-bold' : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Camino</span>
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'evolution' ? 'text-orange-400 font-bold' : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Columns3 className="w-5 h-5" />
          <span className="text-[10px]">Evolución</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'timer' ? 'text-orange-400 font-bold' : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px]">Gestos</span>
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'canvas' ? 'text-orange-400 font-bold' : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Palette className="w-5 h-5" />
          <span className="text-[10px]">Lienzo</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'settings' ? 'text-orange-400 font-bold' : 'text-studio-400 hover:text-studio-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Ajustes</span>
        </button>
      </nav>
    </>
  );
};
