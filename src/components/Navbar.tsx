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
    level >= 10 ? 'Gran Maestro del Atelier' :
    level >= 7 ? 'Ilustrador del Valle' :
    level >= 5 ? 'Mago del Color y Luz' :
    level >= 3 ? 'Explorador de Formas' :
    'Aprendiz de Bocetos';

  return (
    <>
      {/* Desktop & Tablet Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0d1729]/90 backdrop-blur-2xl border-b border-fantasy-border px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand with Local Fantasy Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('roadmap')}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-fantasy-sky via-fantasy-pink to-fantasy-ochre p-[1.5px] shadow-lg shadow-fantasy-sky/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d1422] rounded-[10px] flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic text-xl sm:text-2xl tracking-tight text-white group-hover:text-fantasy-sky transition-colors">
                  Art Street
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] px-1.5 sm:px-2 py-0.5 rounded-full bg-fantasy-pink/15 text-fantasy-pink border border-fantasy-pink/30">
                  MONOGRAFÍA
                </span>
              </div>
              <p className="font-mono text-[9px] text-slate-400 tracking-[0.15em] uppercase hidden sm:block">
                EL CAMINO DEL ARTISTA // 9 FOLIOS DIDÁCTICOS
              </p>
            </div>
          </div>

          {/* Center Navigation on Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0a101d] p-1.5 rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>FOLIOS</span>
            </button>

            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all ${
                activeTab === 'evolution'
                  ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>EVOLUCIÓN</span>
            </button>

            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>GESTOS</span>
            </button>

            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all ${
                activeTab === 'canvas'
                  ? 'bg-gradient-to-r from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/25'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>BLOC</span>
            </button>
          </nav>

          {/* Right Stats & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0a101d] border border-fantasy-ochre/30 text-fantasy-ochre font-mono font-semibold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-fantasy-ochre text-fantasy-ochre" />
              <span className="text-[11px] sm:text-xs">{profile?.streakDays || 1}D RACHA</span>
            </div>

            {/* Level & XP */}
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0a101d] border border-white/[0.08] text-xs">
              <Award className="w-4 h-4 text-fantasy-sky" />
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="font-semibold text-white uppercase">{rankTitle}</span>
                  <span className="text-fantasy-skyLight/80">LVL {level}</span>
                </div>
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-fantasy-sky via-fantasy-pink to-fantasy-lime h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'settings'
                  ? 'bg-fantasy-sky/20 border-fantasy-sky text-fantasy-sky'
                  : 'bg-[#131e33] border-white/[0.08] text-slate-300 hover:text-white'
              }`}
              title="Ajustes de Perfil"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Dock with Safe Area Support */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a101d]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around shadow-2xl">
        {[
          { id: 'roadmap', label: 'Folios', icon: Compass },
          { id: 'evolution', label: 'Evolución', icon: Columns3 },
          { id: 'timer', label: 'Gestos', icon: Timer },
          { id: 'canvas', label: 'Bloc', icon: Palette },
          { id: 'settings', label: 'Ajustes', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 min-w-[56px] rounded-xl transition-all ${
                isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-fantasy-sky to-fantasy-pink text-white shadow-md shadow-fantasy-sky/30'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono tracking-wider uppercase leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
