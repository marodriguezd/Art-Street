import React, { useState, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Maximize2, 
  Camera, 
  Brush, 
  CheckCircle 
} from 'lucide-react';
import { CheckItem, CheckState, CheckProofImage } from '../types/curriculum';

interface ProofUploadModalProps {
  check: CheckItem;
  checkState?: CheckState;
  onClose: () => void;
  onSaveState: (updatedState: CheckState) => void;
  onOpenSketchpad: (check: CheckItem) => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  check,
  checkState,
  onClose,
  onSaveState,
  onOpenSketchpad,
}) => {
  const [images, setImages] = useState<CheckProofImage[]>(checkState?.images || []);
  const [note, setNote] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newImage: CheckProofImage = {
        id: 'proof_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        dataUrl,
        timestamp: new Date().toISOString(),
        note: note.trim() || undefined,
      };

      const updatedImages = [newImage, ...images];
      setImages(updatedImages);
      setNote('');

      // Auto-save and auto-complete check if not yet completed
      onSaveState({
        checkId: check.id,
        completed: true,
        completedAt: checkState?.completedAt || new Date().toISOString(),
        images: updatedImages,
        notes: checkState?.notes,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (imgId: string) => {
    const filtered = images.filter((img) => img.id !== imgId);
    setImages(filtered);
    onSaveState({
      checkId: check.id,
      completed: filtered.length > 0 ? (checkState?.completed ?? true) : false,
      completedAt: checkState?.completedAt,
      images: filtered,
      notes: checkState?.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0c0e14] border border-studio-800/80 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative drafting-corner my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-studio-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                EXPEDIENTE DE TALLER // VERIFICACIÓN
              </span>
            </div>
            <h3 className="font-serif text-2xl text-white italic tracking-tight mt-1">
              {check.title}
            </h3>
            <p className="text-xs text-studio-400 mt-1 leading-relaxed">
              {check.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-studio-800/60 hover:bg-studio-800 text-studio-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Action Row */}
        <div className="my-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Upload File Button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Adjuntar Estudio o Foto</p>
                <p className="font-mono text-[10px] text-studio-500">JPG, PNG o WEBP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Open Canvas Option */}
            <div
              onClick={() => {
                onClose();
                onOpenSketchpad(check);
              }}
              className="border border-dashed border-studio-700/80 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-all bg-[#08090d]/80 hover:bg-[#08090d] flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-studio-800/80 group-hover:bg-amber-500/20 text-studio-400 group-hover:text-amber-400 flex items-center justify-center transition-all">
                <Brush className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Trazar en Bloc Digital</p>
                <p className="font-mono text-[10px] text-studio-500">Boceto directo en app</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-studio-400 mb-1">
              Notas técnicas para este pliego (opcional):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ej. Sesión de 30 minutos con carboncillo y papel craft..."
              className="w-full bg-[#08090d] border border-studio-800 rounded-xl px-3.5 py-2 text-white placeholder-studio-600 text-xs focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Uploaded Proof Gallery */}
        <div>
          <h4 className="font-mono text-[10px] tracking-widest text-studio-400 uppercase mb-3 flex items-center justify-between">
            <span>PLIEGOS REGISTRADOS ({images.length})</span>
            {images.length > 0 && (
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                EJERCICIO CONVALIDADO
              </span>
            )}
          </h4>

          {images.length === 0 ? (
            <div className="text-center py-8 bg-[#08090d] rounded-xl border border-dashed border-studio-800/80">
              <Camera className="w-7 h-7 text-studio-600 mx-auto mb-2" />
              <p className="text-xs text-studio-300">Aún no has anexado pruebas visuales para este check.</p>
              <p className="font-mono text-[10px] text-studio-500 mt-1">
                Sube tu práctica para documentar rigurosamente tu progreso.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-[#08090d] rounded-xl overflow-hidden border border-studio-800 shadow-md"
                >
                  <img
                    src={img.dataUrl}
                    alt="Prueba de ejercicio"
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                    <button
                      type="button"
                      onClick={() => setZoomedImage(img.dataUrl)}
                      className="p-1.5 rounded-lg bg-studio-800/90 text-white hover:bg-studio-700"
                      title="Ver en grande"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 rounded-lg bg-red-900/80 text-white hover:bg-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {img.note && (
                    <div className="p-1.5 bg-[#08090d] border-t border-studio-850">
                      <p className="text-[10px] text-studio-300 truncate font-mono">{img.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-studio-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-studio-800/80 hover:bg-studio-800 text-white font-mono text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl transition-colors"
          >
            Cerrar Folio
          </button>
        </div>
      </div>

      {/* Full Zoom Image Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 bg-black/92 flex items-center justify-center p-4 cursor-pointer backdrop-blur-md"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Zoom de dibujo"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-studio-800"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-studio-900/90 text-white hover:bg-studio-800 border border-studio-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
