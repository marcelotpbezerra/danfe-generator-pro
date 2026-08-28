import React, { useState, useRef } from 'react';
import { Upload, Key, AlertCircle, Search, Sparkles, FileText, Truck, ShieldCheck, Loader2 } from 'lucide-react';

interface XmlUploaderProps {
  onXmlLoaded: (content: string, fileName: string) => void;
  onKeySubmit: (key: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const XmlUploader: React.FC<XmlUploaderProps> = ({
  onXmlLoaded,
  onKeySubmit,
  isLoading,
  error,
}) => {
  const [mode, setMode] = useState<'xml' | 'key'>('xml');
  const [accessKey, setAccessKey] = useState('');
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

  const handleKeyFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = accessKey.replace(/\D/g, '');
    if (cleanKey.length !== 44) {
      alert('A chave de acesso deve conter exatamente 44 dígitos numéricos.');
      return;
    }
    onKeySubmit(cleanKey);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Mode Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-2xl p-1 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setMode('xml')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'xml'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload de Arquivo XML</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('key')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === 'key'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Chave de Acesso (44 Dígitos)</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Content */}
      {mode === 'xml' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-200 ${
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
            <div className="p-5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Arraste o arquivo XML ou clique para selecionar
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Suporte nativo e instantâneo a <strong>NF-e (DANFE - Modelo 55)</strong> e <strong>CT-e (DACTE - Modelo 57)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-400 border border-slate-700">
                <FileText className="w-3.5 h-3.5" /> NF-e Modelo 55
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-400 border border-slate-700">
                <Truck className="w-3.5 h-3.5" /> CT-e Modelo 57
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl">
          <form onSubmit={handleKeyFormSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Digite ou Cole a Chave de Acesso (44 Dígitos)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.replace(/\D/g, '').substring(0, 44))}
                  placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-base font-mono font-bold text-white tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                  {accessKey.length}/44
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                A consulta é realizada diretamente nos servidores da SEFAZ / API MeuDanfe V2.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || accessKey.length !== 44}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando SEFAZ...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Consultar e Gerar DANFE / DACTE</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
