import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  ExternalLink, 
  Brush, 
  Volume2, 
  VolumeX, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { playChimeSound } from '../utils/audio';

interface GestureTimerModalProps {
  onOpenCanvas: () => void;
}

export const GestureTimerModal: React.FC<GestureTimerModalProps> = ({
  onOpenCanvas,
}) => {
  const [intervals] = useState([
    { label: '30s', seconds: 30 },
    { label: '45s', seconds: 45 },
    { label: '60s', seconds: 60 },
    { label: '90s', seconds: 90 },
    { label: '2 min', seconds: 120 },
    { label: '5 min', seconds: 300 },
    { label: '10 min', seconds: 600 },
  ]);

  const [selectedInterval, setSelectedInterval] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [posesCount, setPosesCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Interval Change
  const handleSelectInterval = (secs: number) => {
    setSelectedInterval(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Pose completed!
            if (soundEnabled) {
              playChimeSound();
            }
            setPosesCount((c) => c + 1);
            return selectedInterval; // Loop to next pose!
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedInterval, soundEnabled]);

  const handleNextPose = () => {
    if (soundEnabled) playChimeSound();
    setPosesCount((c) => c + 1);
    setTimeLeft(selectedInterval);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedInterval);
    setPosesCount(0);
  };

  // Circular progress calculations
  const progressPercent = ((selectedInterval - timeLeft) / selectedInterval) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] tracking-widest uppercase mb-2">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>GIMNASIO DE RITMO Y DINÁMICA DE FIGURA</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-white italic tracking-tight">
          Cronómetro de Gesto Rápido
        </h2>
        <p className="text-xs sm:text-sm text-studio-300 mt-2 max-w-lg mx-auto leading-relaxed font-sans">
          El gesto intervalado (30s a 2m) desactiva el juicio racional para capturar la línea de acción, el peso corporal y la vitalidad del modelo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left / Center Clock Column */}
        <div className="md:col-span-7 bg-[#0c0e14] border border-studio-800/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden drafting-corner">
          {/* Sound toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-studio-800/60 text-studio-400 hover:text-white border border-studio-800/60 transition-colors"
            title={soundEnabled ? 'Silenciar campana' : 'Activar sonido de campana'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Preset Interval Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {intervals.map((item) => (
              <button
                key={item.seconds}
                onClick={() => handleSelectInterval(item.seconds)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all ${
                  selectedInterval === item.seconds
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-[#08090d] border-studio-800 text-studio-400 hover:border-studio-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Circular Countdown Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-studio-850 stroke-current"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-amber-400 stroke-current transition-all duration-300"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="font-mono font-bold text-5xl sm:text-6xl text-white tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="font-mono text-[10px] text-studio-400 uppercase tracking-widest mt-1">
                {isRunning ? 'EN TRAZO ACTIVO' : 'PAUSADO'}
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs text-studio-300 bg-[#08090d] px-4 py-2 rounded-xl border border-studio-800 my-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{posesCount} POSES CONQUISTADAS</span>
            </span>
            <span className="text-studio-700">•</span>
            <span className="text-studio-400">TOTAL: ~{Math.round((posesCount * selectedInterval) / 60)} MIN</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-xl bg-studio-800/60 hover:bg-studio-800 text-studio-400 hover:text-white transition-colors border border-studio-800/60"
              title="Reiniciar cronómetro"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-4 sm:p-5 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center ${
                isRunning
                  ? 'bg-studio-800 hover:bg-studio-700 border border-amber-500/40 text-amber-400'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-900/20 scale-105'
              }`}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5 fill-white" />}
            </button>

            <button
              onClick={handleNextPose}
              className="p-3.5 rounded-xl bg-studio-800/60 hover:bg-studio-800 text-studio-400 hover:text-white transition-colors border border-studio-800/60"
              title="Siguiente pose"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Recommended Resources and Canvas Opener */}
        <div className="md:col-span-5 space-y-4">
          {/* Direct Canvas Launch Card */}
          <div className="bg-[#0c0e14] border border-studio-800/80 rounded-2xl p-5 shadow-lg relative drafting-corner">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] tracking-widest uppercase mb-2">
              <Brush className="w-3.5 h-3.5" />
              <span>SOPORTE DIGITAL INMEDIATO</span>
            </div>
            <h3 className="font-serif text-xl text-white italic">
              ¿Sin papel o tableta a mano?
            </h3>
            <p className="text-xs text-studio-300 mt-1 leading-relaxed mb-4 font-sans">
              Utiliza el bloc digital integrado mientras corre el cronómetro para calentar el trazo con la mano o ratón.
            </p>
            <button
              onClick={onOpenCanvas}
              className="w-full bg-studio-800/80 hover:bg-studio-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-mono text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Brush className="w-4 h-4" />
              <span>Desplegar Bloc Digital</span>
            </button>
          </div>

          {/* Curated Reference Sites */}
          <div className="bg-[#0c0e14] border border-studio-800/80 rounded-2xl p-5">
            <h3 className="font-serif text-lg text-white italic mb-1">
              Catálogo de Poses del Currículum
            </h3>
            <p className="text-xs text-studio-400 mb-4 font-sans">
              Abre los bancos de poses de referencia recomendados por el programa en pantalla dividida:
            </p>

            <div className="space-y-2">
              <a
                href="https://line-of-action.com/practice-tools/figure-drawing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-[#08090d] hover:bg-studio-900 border border-studio-800/80 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Line of Action
                  </p>
                  <p className="font-mono text-[10px] text-studio-500">Herramienta cronometrada de figura y expresión</p>
                </div>
                <ExternalLink className="w-4 h-4 text-studio-500 group-hover:text-white" />
              </a>

              <a
                href="https://vimeo.com/channels/croquiscafe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-[#08090d] hover:bg-studio-900 border border-studio-800/80 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Croquis Cafe (Vimeo)
                  </p>
                  <p className="font-mono text-[10px] text-studio-500">Sesiones con modelos vivos en rotación 360°</p>
                </div>
                <ExternalLink className="w-4 h-4 text-studio-500 group-hover:text-white" />
              </a>

              <a
                href="https://quickposes.com/en/gestures/timed"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-[#08090d] hover:bg-studio-900 border border-studio-800/80 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Quickposes
                  </p>
                  <p className="font-mono text-[10px] text-studio-500">Archivo masivo de anatomía, manos y escorzos</p>
                </div>
                <ExternalLink className="w-4 h-4 text-studio-500 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
