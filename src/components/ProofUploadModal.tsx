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
      <div className="bg-studio-900 border border-studio-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-studio-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Pruebas de Práctica
            </span>
            <h3 className="font-display font-black text-xl text-white mt-1.5">
              {check.title}
            </h3>
            <p className="text-xs text-studio-400 mt-1">
              {check.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-studio-400 hover:text-white transition-colors"
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
              className="border-2 border-dashed border-studio-700 hover:border-orange-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-studio-800 group-hover:bg-orange-500/20 text-studio-400 group-hover:text-orange-400 flex items-center justify-center transition-all">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Subir Foto o Escaneo</p>
                <p className="text-[10px] text-studio-400">JPG, PNG o WEBP</p>
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
              className="border-2 border-dashed border-studio-700 hover:border-purple-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-studio-950/60 hover:bg-studio-950 flex items-center justify-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-studio-800 group-hover:bg-purple-500/20 text-studio-400 group-hover:text-purple-400 flex items-center justify-center transition-all">
                <Brush className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Dibujar en Lienzo</p>
                <p className="text-[10px] text-studio-400">Crear boceto en la app</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-studio-400 mb-1">
              Nota para las próximas fotos que subas (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ej. Sesión de 30 minutos con lápiz 2B y papel bond..."
              className="w-full bg-studio-950 border border-studio-800 rounded-xl px-3.5 py-2 text-white placeholder-studio-500 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Uploaded Proof Gallery */}
        <div>
          <h4 className="text-xs font-bold text-studio-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Dibujos adjuntos ({images.length})</span>
            {images.length > 0 && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Ejercicio verificado
              </span>
            )}
          </h4>

          {images.length === 0 ? (
            <div className="text-center py-8 bg-studio-950/40 rounded-2xl border border-studio-800/60">
              <Camera className="w-8 h-8 text-studio-600 mx-auto mb-2" />
              <p className="text-xs text-studio-400">Aún no has adjuntado fotos de este ejercicio.</p>
              <p className="text-[11px] text-studio-500 mt-0.5">
                Sube tu práctica para documentar cada paso de tu camino.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-studio-950 rounded-xl overflow-hidden border border-studio-800 shadow-md"
                >
                  <img
                    src={img.dataUrl}
                    alt="Prueba de ejercicio"
                    className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => setZoomedImage(img.dataUrl)}
                      className="p-1.5 rounded-lg bg-studio-800 text-white hover:bg-studio-700"
                      title="Ver en grande"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {img.note && (
                    <div className="p-1.5 bg-studio-950 border-t border-studio-850">
                      <p className="text-[10px] text-studio-300 truncate">{img.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-studio-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-studio-800 hover:bg-studio-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
          >
            Listo
          </button>
        </div>
      </div>

      {/* Full Zoom Image Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Zoom de dibujo"
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
