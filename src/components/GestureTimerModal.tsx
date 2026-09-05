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
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Flame className="w-3.5 h-3.5 fill-orange-500" />
          <span>Gimnasio de Calentamiento y Gesto</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
          Temporizador de Práctica y Gestos
        </h2>
        <p className="text-xs sm:text-sm text-studio-400 mt-1 max-w-lg mx-auto">
          El gesto rápido (30s a 2m) es la clave para eliminar la rigidez y aprender a capturar el ritmo y la vida de la figura humana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left / Center Clock Column */}
        <div className="md:col-span-7 bg-studio-900/90 border border-studio-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
          {/* Sound toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-studio-800 text-studio-400 hover:text-white"
            title={soundEnabled ? 'Silenciar campana' : 'Activar sonido de campana'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Preset Interval Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {intervals.map((item) => (
              <button
                key={item.seconds}
                onClick={() => handleSelectInterval(item.seconds)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedInterval === item.seconds
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-studio-950 border-studio-800 text-studio-400 hover:border-studio-700'
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
                className="text-studio-800 stroke-current"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-orange-500 stroke-current transition-all duration-300"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="font-mono font-black text-4xl sm:text-5xl text-white tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[11px] font-bold text-studio-400 uppercase tracking-wider mt-1">
                {isRunning ? 'Dibujando...' : 'En pausa'}
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs font-bold text-studio-300 bg-studio-950 px-4 py-2 rounded-xl border border-studio-800 my-4">
            <span className="flex items-center gap-1.5 text-orange-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{posesCount} poses completadas</span>
            </span>
            <span className="text-studio-600">•</span>
            <span>Total: ~{Math.round((posesCount * selectedInterval) / 60)} min</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-studio-800 hover:bg-studio-700 text-studio-400 hover:text-white transition-colors"
              title="Reiniciar contador"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30 scale-105'
              }`}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleNextPose}
              className="p-3.5 rounded-2xl bg-studio-800 hover:bg-studio-700 text-studio-400 hover:text-white transition-colors"
              title="Siguiente pose"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Recommended Resources and Canvas Opener */}
        <div className="md:col-span-5 space-y-4">
          {/* Direct Canvas Launch Card */}
          <div className="bg-gradient-to-br from-purple-950/40 to-studio-900 border border-purple-500/30 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Brush className="w-4 h-4" />
              <span>Dibuja aquí mismo</span>
            </div>
            <h3 className="font-display font-extrabold text-lg text-white">
              ¿No tienes papel o tableta a mano?
            </h3>
            <p className="text-xs text-studio-300 mt-1 leading-relaxed mb-4">
              Usa el lienzo integrado de Art Street mientras corre el temporizador para hacer tus bocetos rápidos con el dedo o ratón.
            </p>
            <button
              onClick={onOpenCanvas}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all"
            >
              <Brush className="w-4 h-4" />
              <span>Abrir Lienzo Digital</span>
            </button>
          </div>

          {/* Curated Reference Sites (Croquis Cafe, Line of Action) */}
          <div className="bg-studio-900 border border-studio-800 rounded-3xl p-5">
            <h3 className="font-bold text-sm text-white mb-2">
              Bases de Poses para la Práctica
            </h3>
            <p className="text-xs text-studio-400 mb-4">
              Abre una de estas webs gratuitas recomendadas por el currículum en otra pestaña o pantalla dividida:
            </p>

            <div className="space-y-2">
              <a
                href="https://line-of-action.com/practice-tools/figure-drawing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-studio-950 hover:bg-studio-800 border border-studio-800 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-orange-400">
                    Line of Action
                  </p>
                  <p className="text-[10px] text-studio-400">Herramienta de poses con temporizador integrado</p>
                </div>
                <ExternalLink className="w-4 h-4 text-studio-500 group-hover:text-white" />
              </a>

              <a
                href="https://vimeo.com/channels/croquiscafe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-studio-950 hover:bg-studio-800 border border-studio-800 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-orange-400">
                    Croquis Cafe (Vimeo)
                  </p>
                  <p className="text-[10px] text-studio-400">Sesiones profesionales con modelos reales en 360°</p>
                </div>
                <ExternalLink className="w-4 h-4 text-studio-500 group-hover:text-white" />
              </a>

              <a
                href="https://quickposes.com/en/gestures/timed"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-studio-950 hover:bg-studio-800 border border-studio-800 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-orange-400">
                    Quickposes
                  </p>
                  <p className="text-[10px] text-studio-400">Biblioteca masiva de poses de cuerpo y manos</p>
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
