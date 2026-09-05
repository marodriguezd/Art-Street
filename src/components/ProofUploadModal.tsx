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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111c30] border border-white/[0.1] w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-4 sm:p-6 shadow-2xl relative my-auto sm:my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-[10px] sm:text-xs uppercase font-bold tracking-wider text-fantasy-pink bg-fantasy-pink/15 px-2.5 sm:px-3 py-1 rounded-full border border-fantasy-pink/30">
                EVIDENCIA DE PRÁCTICA // REVISIÓN
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
              {check.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans font-medium">
              {check.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors flex-shrink-0"
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
              className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-sky rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#0b1320] hover:bg-[#0f192b] flex items-center justify-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-fantasy-sky/15 group-hover:bg-fantasy-sky/25 text-fantasy-sky flex items-center justify-center transition-all border border-fantasy-sky/30">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-display font-bold text-white">Adjuntar Estudio o Foto</p>
                <p className="font-sans text-[11px] text-slate-400">JPG, PNG o WEBP</p>
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
              className="border-2 border-dashed border-white/[0.15] hover:border-fantasy-pink rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#0b1320] hover:bg-[#0f192b] flex items-center justify-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-fantasy-pink/15 group-hover:bg-fantasy-pink/25 text-fantasy-pink flex items-center justify-center transition-all border border-fantasy-pink/30">
                <Brush className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-display font-bold text-white">Trazar en Bloc Digital</p>
                <p className="font-sans text-[11px] text-slate-400">Boceto directo en app</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-display text-xs uppercase font-bold tracking-wider text-slate-300 mb-1.5">
              Notas técnicas para este ejercicio (opcional):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ej. Sesión de 30 minutos con pluma y papel punteado..."
              className="w-full bg-[#0b1320] border border-white/[0.1] rounded-2xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fantasy-sky font-sans"
            />
          </div>
        </div>

        {/* Uploaded Proof Gallery */}
        <div>
          <h4 className="font-display text-xs tracking-wider text-slate-300 uppercase font-bold mb-3 flex items-center justify-between">
            <span>PLIEGOS REGISTRADOS ({images.length})</span>
            {images.length > 0 && (
              <span className="text-fantasy-lime flex items-center gap-1.5 font-display font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                EJERCICIO COMPLETADO
              </span>
            )}
          </h4>

          {images.length === 0 ? (
            <div className="text-center py-8 bg-[#0b1320] rounded-2xl border-2 border-dashed border-white/[0.1]">
              <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-display font-bold text-slate-200">Aún no has anexado pruebas visuales para este check.</p>
              <p className="font-sans text-[11px] text-slate-400 mt-1">
                Sube tu práctica para documentar rigurosamente tu progreso.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-[#0b1320] rounded-2xl overflow-hidden border border-white/[0.1] shadow-md"
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
                      className="p-2 rounded-xl bg-white/[0.15] text-white hover:bg-white/[0.25]"
                      title="Ver en grande"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {img.note && (
                    <div className="p-2 bg-[#080d16] border-t border-white/[0.06]">
                      <p className="text-[11px] text-slate-300 truncate font-sans font-medium">{img.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0b1320] hover:bg-[#142035] border border-white/[0.1] text-white font-display text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-2xl transition-colors"
          >
            Cerrar Ventana
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
