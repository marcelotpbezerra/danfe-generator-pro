import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle, FileCheck, Truck, Receipt } from 'lucide-react';

interface XmlUploaderProps {
  onXmlLoaded: (content: string, fileName: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const XmlUploader: React.FC<XmlUploaderProps> = ({ onXmlLoaded, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Por favor, selecione um arquivo XML válido (.xml).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onXmlLoaded(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Arraste o arquivo XML ou clique para selecionar
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Suporte nativo a <strong>NF-e (DANFE - Modelo 55)</strong> e <strong>CT-e (DACTE - Modelo 57)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-400 border border-slate-700">
              <Receipt className="w-3.5 h-3.5" /> NF-e 4.00
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-400 border border-slate-700">
              <Truck className="w-3.5 h-3.5" /> CT-e 3.00 / 4.00
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
