import React, { useState, useRef, useEffect } from 'react';
import { 
  Columns3, 
  Calendar, 
  Star, 
  Maximize2, 
  Award,
  Layers,
  TrendingUp,
  X
} from 'lucide-react';
import { MilestoneArtwork, UserProfile } from '../types/curriculum';

interface EvolutionStudioProps {
  profile?: UserProfile | null;
  milestones: MilestoneArtwork[];
  onOpenGraduationForTerm?: (termNum: number) => void;
}

export const EvolutionStudio: React.FC<EvolutionStudioProps> = ({
  milestones,
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide' | 'timeline'>('slider');
  
  // Selection for comparison
  const [beforeIndex, setBeforeIndex] = useState<number>(0);
  const [afterIndex, setAfterIndex] = useState<number>(milestones.length > 1 ? milestones.length - 1 : 0);

  // Slider position (0 to 100%)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Full zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Make sure indices are in bounds
  useEffect(() => {
    if (milestones.length > 1 && afterIndex === 0) {
      setAfterIndex(milestones.length - 1);
    }
  }, [milestones.length, afterIndex]);

  const beforeArtwork = milestones[beforeIndex] || milestones[0];
  const afterArtwork = milestones[afterIndex] || milestones[milestones.length - 1] || beforeArtwork;

  // Handle Dragging
  const handleDragMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const posPercent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(posPercent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleDragMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleDragMove(e.touches[0].clientX);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono font-bold text-[10px] uppercase tracking-widest mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>ARCHIVO COMPARATIVO // METAMORFOSIS TÉCNICA</span>
        </div>
        <h2 className="font-serif italic font-normal text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight">
          Estudio de Evolución
        </h2>
        <p className="text-xs sm:text-sm text-atelier-300 mt-2 max-w-lg mx-auto font-sans font-light">
          Contempla tu salto visual contrastando el punto de partida inicial (Nivel 0) con las obras concebidas tras cada lección del currículum.
        </p>

        {/* View Mode Switcher */}
        <div className="inline-flex items-center gap-1.5 bg-atelier-900/90 p-1.5 rounded-2xl border border-white/[0.08] mt-6 shadow-xl">
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              viewMode === 'slider'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'text-atelier-400 hover:text-white'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>DESLIZADOR DIVISOR</span>
          </button>

          <button
            onClick={() => setViewMode('sideBySide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              viewMode === 'sideBySide'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'text-atelier-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>LADO A LADO</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                : 'text-atelier-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>GALERÍA HISTÓRICA ({milestones.length})</span>
          </button>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-16 bg-studio-900/60 rounded-3xl border border-studio-800 max-w-lg mx-auto p-6">
          <Award className="w-12 h-12 text-studio-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-white">Aún no hay obras registradas</h3>
          <p className="text-xs text-studio-400 mt-1">
            Al completar tu perfil y graduarte de los términos, aquí aparecerán tus hitos para comparar tu progreso.
          </p>
        </div>
      ) : (
        <div>
          {/* Milestone Selectors for Comparison (Slider & Side-by-Side) */}
          {viewMode !== 'timeline' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-atelier-900/80 p-5 rounded-2xl border border-white/[0.08] shadow-lg">
              {/* Before Selector */}
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-atelier-400 mb-2 flex items-center justify-between">
                  <span>PUNTO INICIAL ("ANTES"):</span>
                  <span className="text-orange-400 font-normal">
                    {beforeArtwork?.termTitle || 'Nivel 0'}
                  </span>
                </label>
                <select
                  value={beforeIndex}
                  onChange={(e) => setBeforeIndex(Number(e.target.value))}
                  className="w-full bg-atelier-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs font-medium focus:outline-none focus:border-orange-500/60 shadow-inner"
                >
                  {milestones.map((m, idx) => (
                    <option key={m.id} value={idx}>
                      {m.termNumber === 0 ? 'Nivel 0: Punto de Partida' : `Término ${m.termNumber}: ${m.title}`} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* After Selector */}
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-atelier-400 mb-2 flex items-center justify-between">
                  <span>PUNTO AVANZADO ("DESPUÉS"):</span>
                  <span className="text-emerald-400 font-normal">
                    {afterArtwork?.termTitle || 'Término Reciente'}
                  </span>
                </label>
                <select
                  value={afterIndex}
                  onChange={(e) => setAfterIndex(Number(e.target.value))}
                  className="w-full bg-atelier-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono text-xs font-medium focus:outline-none focus:border-orange-500/60 shadow-inner"
                >
                  {milestones.map((m, idx) => (
                    <option key={m.id} value={idx}>
                      {m.termNumber === 0 ? 'Nivel 0: Punto de Partida' : `Término ${m.termNumber}: ${m.title}`} ({m.date})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* MODE 1: INTERACTIVE SPLIT SLIDER */}
          {viewMode === 'slider' && beforeArtwork && afterArtwork && (
            <div className="bg-atelier-900/70 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 sm:p-8 shadow-2xl drafting-corner">
              {/* Slider Viewport */}
              <div
                ref={sliderContainerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="relative w-full h-[450px] sm:h-[580px] rounded-2xl overflow-hidden bg-atelier-950 select-none cursor-ew-resize border border-white/[0.08] shadow-inner"
              >
                {/* Image 2 (After - Full background) */}
                <img
                  src={afterArtwork.dataUrl}
                  alt={afterArtwork.title}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Image 1 (Before - Clipped on top) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforeArtwork.dataUrl}
                    alt={beforeArtwork.title}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    style={{
                      width: sliderContainerRef.current?.clientWidth || '100%',
                      maxWidth: 'none',
                    }}
                  />
                </div>

                {/* Vertical Divider Bar with Titanium Handle */}
                <div
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                  className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-400 via-white to-orange-400 cursor-ew-resize shadow-[0_0_15px_rgba(249,115,22,0.6)] flex items-center justify-center pointer-events-auto"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-9 h-9 rounded-full bg-atelier-950 text-white flex items-center justify-center shadow-2xl border-2 border-orange-500 font-mono text-xs font-black ring-4 ring-orange-500/20">
                    ↔
                  </div>
                </div>

                {/* Floating Frosted Badges */}
                <div className="absolute top-4 left-4 bg-atelier-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white font-mono text-[11px] font-bold flex items-center gap-2 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span>ANTES // {beforeArtwork.termNumber === 0 ? 'NIVEL 0.0' : `FOLIO ${beforeArtwork.termNumber}`}</span>
                </div>

                <div className="absolute top-4 right-4 bg-atelier-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white font-mono text-[11px] font-bold flex items-center gap-2 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>DESPUÉS // {afterArtwork.termNumber === 0 ? 'NIVEL 0.0' : `FOLIO ${afterArtwork.termNumber}`}</span>
                </div>
              </div>

              {/* Information Cards Below Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
                {/* Left Artwork Info */}
                <div className="bg-atelier-950/80 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                      PLACA ORIGEN
                    </span>
                    <span className="text-[11px] text-atelier-400">{beforeArtwork.date}</span>
                  </div>
                  <h4 className="font-serif italic text-xl text-white mb-2 leading-tight">{beforeArtwork.title}</h4>
                  <p className="text-xs text-atelier-300 font-light italic leading-relaxed">
                    "{beforeArtwork.reflectionNotes || 'Sin notas registradas'}"
                  </p>
                </div>

                {/* Right Artwork Info */}
                <div className="bg-atelier-950/80 p-5 rounded-2xl border border-white/[0.06] shadow-sm">
                  <div className="flex items-center justify-between mb-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      PLACA GRADUACIÓN
                    </span>
                    <span className="text-[11px] text-atelier-400">{afterArtwork.date}</span>
                  </div>
                  <h4 className="font-serif italic text-xl text-white mb-2 leading-tight">{afterArtwork.title}</h4>
                  <p className="text-xs text-atelier-300 font-light italic leading-relaxed">
                    "{afterArtwork.reflectionNotes || 'Sin notas registradas'}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: SIDE BY SIDE */}
          {viewMode === 'sideBySide' && beforeArtwork && afterArtwork && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Before Card */}
              <div className="bg-studio-900 border border-studio-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 font-bold text-xs border border-orange-500/20">
                      Antes • {beforeArtwork.termTitle}
                    </span>
                    <span className="text-xs text-studio-400">{beforeArtwork.date}</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-3">{beforeArtwork.title}</h3>
                  <div className="bg-studio-950 rounded-2xl p-2 border border-studio-800 mb-3 flex items-center justify-center h-80">
                    <img
                      src={beforeArtwork.dataUrl}
                      alt={beforeArtwork.title}
                      className="max-h-full max-w-full rounded-xl object-contain cursor-pointer"
                      onClick={() => setZoomedImage(beforeArtwork.dataUrl)}
                    />
                  </div>
                </div>
                <div className="bg-studio-950 p-3 rounded-xl border border-studio-850 text-xs text-studio-300">
                  <p className="font-bold text-studio-400 text-[10px] uppercase mb-0.5">Reflexión:</p>
                  <p className="italic">"{beforeArtwork.reflectionNotes}"</p>
                </div>
              </div>

              {/* After Card */}
              <div className="bg-studio-900 border border-studio-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                      Después • {afterArtwork.termTitle}
                    </span>
                    <span className="text-xs text-studio-400">{afterArtwork.date}</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-3">{afterArtwork.title}</h3>
                  <div className="bg-studio-950 rounded-2xl p-2 border border-studio-800 mb-3 flex items-center justify-center h-80">
                    <img
                      src={afterArtwork.dataUrl}
                      alt={afterArtwork.title}
                      className="max-h-full max-w-full rounded-xl object-contain cursor-pointer"
                      onClick={() => setZoomedImage(afterArtwork.dataUrl)}
                    />
                  </div>
                </div>
                <div className="bg-studio-950 p-3 rounded-xl border border-studio-850 text-xs text-studio-300">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-studio-400 text-[10px] uppercase">Reflexión:</p>
                    {afterArtwork.hoursSpent && (
                      <span className="text-[10px] text-orange-400 font-bold">
                        {afterArtwork.hoursSpent} horas invertidas
                      </span>
                    )}
                  </div>
                  <p className="italic">"{afterArtwork.reflectionNotes}"</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: TIMELINE OF EVOLUTION */}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="bg-studio-900 border border-studio-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between group hover:border-studio-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-studio-950 text-orange-400 font-bold text-xs border border-studio-800">
                          {m.termNumber === 0 ? 'Punto de Partida' : `Término ${m.termNumber}`}
                        </span>
                        <span className="text-[11px] text-studio-400">{m.date}</span>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {m.title}
                      </h4>

                      <div
                        onClick={() => setZoomedImage(m.dataUrl)}
                        className="bg-studio-950 rounded-2xl p-2 border border-studio-800 mb-3 h-52 flex items-center justify-center cursor-pointer group-hover:border-studio-700 transition-colors relative overflow-hidden"
                      >
                        <img
                          src={m.dataUrl}
                          alt={m.title}
                          className="max-h-full max-w-full rounded-xl object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-studio-950 p-3 rounded-xl border border-studio-850 text-xs">
                      <p className="text-studio-400 text-[11px] line-clamp-2 italic">
                        "{m.reflectionNotes}"
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-studio-900 text-[10px] text-studio-500">
                        <span>{m.hoursSpent ? `${m.hoursSpent}h dedicadas` : 'Práctica'}</span>
                        {m.confidenceRating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(m.confidenceRating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Zoom Image Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Zoom de obra de evolución"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-studio-900/80 text-white hover:bg-studio-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
