import React from 'react';
import { FileText, ShieldCheck, Github, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">DANFE & DACTE Generator Pro</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visualizador e gerador de documentos fiscais (NF-e 55 & CT-e 57)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacidade Total (Zero Upload)</span>
          </div>

          <a
            href="https://github.com/marcelotpbezerra/danfe-generator-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Ver no GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
