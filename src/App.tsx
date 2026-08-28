import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { XmlUploader } from './components/XmlUploader';
import { DanfeView } from './components/DanfeView';
import { DacteView } from './components/DacteView';
import { DocumentData } from './types/fiscal';
import { parseXmlContent, formatAccessKey } from './services/fiscalParser';
import { Printer, Download, RefreshCw, Copy, Check, FileJson, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const App: React.FC = () => {
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleXmlLoaded = (xmlContent: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = parseXmlContent(xmlContent);
      setDocData(parsed);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo XML.');
      setDocData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDocData(null);
    setError(null);
  };

  const handleCopyKey = () => {
    if (!docData?.accessKey) return;
    navigator.clipboard.writeText(docData.accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printRef.current || !docData) return;
    setIsExportingPdf(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${docData.docType.toUpperCase()}_${docData.number || 'documento'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJson = () => {
    if (!docData) return;
    const jsonStr = JSON.stringify(docData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docData.docType.toUpperCase()}_${docData.number || 'doc'}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {!docData ? (
          <div className="py-12 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> NF-e (DANFE) & CT-e (DACTE)
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Leitor Fiscal Instantâneo
              </h2>
              <p className="text-sm text-slate-400">
                Visualize, confira tributos e gere o PDF oficial de notas fiscais e conhecimentos de transporte
                diretamente no seu navegador com privacidade e segurança total.
              </p>
            </div>

            <XmlUploader
              onXmlLoaded={handleXmlLoaded}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Action Bar */}
            <div className="no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  {docData.docType === 'nfe' ? 'DANFE (NF-e)' : 'DACTE (CT-e)'}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">Nº {docData.number} • Série {docData.series}</h2>
                  <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                    {docData.emitente.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                  title="Copiar Chave de Acesso"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Chave'}</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-colors"
                  title="Exportar dados estruturados em JSON"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition-colors"
                  title="Imprimir documento oficial em folha A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir A4</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition-colors disabled:opacity-50"
                  title="Baixar arquivo PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Gerando...' : 'Salvar PDF'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-colors ml-auto sm:ml-0"
                  title="Carregar outro arquivo XML"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              </div>
            </div>

            {/* Document Render Container */}
            <div ref={printRef} className="printable-doc-wrapper overflow-x-auto py-2">
              {docData.docType === 'nfe' ? (
                <DanfeView data={docData} />
              ) : (
                <DacteView data={docData} />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="no-print bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>Desenvolvido por <strong>Marcelo Bezerra</strong> • Processamento 100% no navegador.</p>
      </footer>
    </div>
  );
};

export default App;
