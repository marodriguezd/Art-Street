import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Trash2, 
  Check, 
  PenTool, 
  Eraser, 
  Brush as BrushIcon 
} from 'lucide-react';
import { CheckItem } from '../types/curriculum';

interface SketchpadModalProps {
  check?: CheckItem | null;
  onClose: () => void;
  onSaveSketch: (dataUrl: string, note?: string) => void;
}

export const SketchpadModal: React.FC<SketchpadModalProps> = ({
  check,
  onClose,
  onSaveSketch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<'pen' | 'brush' | 'eraser'>('pen');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [sketchNote, setSketchNote] = useState('');

  // Palette colors
  const palette = [
    '#ffffff', // White
    '#f97316', // Orange
    '#38bdf8', // Sky Blue
    '#a855f7', // Purple
    '#ef4444', // Red
    '#22c55e', // Green
    '#eab308', // Yellow
    '#71717a', // Gray
    '#0f172a', // Dark
  ];

  // Initialize Canvas size to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = Math.min(window.innerWidth - 48, 850);
    const height = Math.min(window.innerHeight - 260, 550);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a'; // dark canvas paper
      ctx.fillRect(0, 0, width, height);

      // Save initial state to history
      const initialData = ctx.getImageData(0, 0, width, height);
      setHistory([initialData]);
    }
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), current]); // keep last 15 steps
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  // Drawing Handlers
  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = brushSize * 4;
    } else if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize * 2.5;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryState();
  };

  // Mouse Events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  // Touch Events (Mobile/Tablet support with preventDefault)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !touch) return;
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !touch) return;
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSketch(dataUrl, sketchNote.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0c0e14] border border-studio-800/80 w-full max-w-4xl rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col relative drafting-corner my-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-studio-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                BLOC DIGITAL // ATELIER
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-white italic tracking-tight mt-1">
              {check ? check.title : 'Lienzo de Práctica Libre'}
            </h3>
            <p className="text-xs text-studio-400 font-sans">
              {check ? 'Captura tu ejercicio y guárdalo como prueba técnica convalidada' : 'Espacio de estudio gestual y calentamiento anatómico'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-studio-800/60 hover:bg-studio-800 text-studio-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#08090d] px-3.5 rounded-xl my-3 border border-studio-800/80">
          {/* Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                tool === 'pen'
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300'
                  : 'text-studio-400 hover:bg-studio-800 hover:text-white'
              }`}
              title="Grafito Fino"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grafito</span>
            </button>

            <button
              onClick={() => setTool('brush')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                tool === 'brush'
                  ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300'
                  : 'text-studio-400 hover:bg-studio-800 hover:text-white'
              }`}
              title="Pincel Carboncillo"
            >
              <BrushIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pincel</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                tool === 'eraser'
                  ? 'bg-studio-700 text-white shadow-sm'
                  : 'text-studio-400 hover:bg-studio-800 hover:text-white'
              }`}
              title="Goma de Migajón"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Goma</span>
            </button>
          </div>

          {/* Size Slider */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-studio-400 uppercase tracking-wider">CALIBRE</span>
            <input
              type="range"
              min="1"
              max="35"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16 sm:w-24 accent-amber-500"
            />
            <span className="font-mono text-[11px] text-studio-300 w-4">{brushSize}</span>
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1.5">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('pen');
                }}
                className={`w-4 h-4 rounded-full border transition-all ${
                  color === c && tool !== 'eraser'
                    ? 'ring-2 ring-amber-400 scale-125 border-white'
                    : 'border-studio-700 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === 'eraser') setTool('pen');
              }}
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 ml-1"
              title="Pigmento personalizado"
            />
          </div>

          {/* Undo and Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-lg text-studio-400 hover:text-white hover:bg-studio-800 disabled:opacity-30 transition-colors"
              title="Deshacer trazo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-studio-400 hover:text-red-400 hover:bg-studio-800 transition-colors"
              title="Limpiar soporte"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-[#050608] rounded-xl overflow-hidden border border-studio-800 shadow-inner relative touch-none"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair shadow-2xl"
          />
        </div>

        {/* Footer with note and save button */}
        <div className="mt-3 pt-3 border-t border-studio-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            value={sketchNote}
            onChange={(e) => setSketchNote(e.target.value)}
            placeholder="Nota del pliego (ej. Estudio de escorzo de mano, 5 min)..."
            className="w-full sm:w-80 bg-[#08090d] border border-studio-800 rounded-xl px-3 py-2 text-xs text-white placeholder-studio-600 focus:outline-none focus:border-amber-500 font-sans"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider text-studio-400 hover:text-white bg-studio-800/60 hover:bg-studio-800 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-900/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Pliego</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
