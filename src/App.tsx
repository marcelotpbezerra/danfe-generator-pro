import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { XmlUploader } from './components/XmlUploader';
import { DanfeView } from './components/DanfeView';
import { DacteView } from './components/DacteView';
import { DocumentData } from './types/fiscal';
import {
  parseXmlContent,
  formatAccessKey,
  fetchOfficialPdf,
  registerXmlOnApi,
  fetchNfeDataByKey,
} from './services/fiscalParser';
import {
  Printer,
  Download,
  RefreshCw,
  Copy,
  Check,
  FileJson,
  FileDown,
  Sparkles,
  CheckCircle2,
  Cloud,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const App: React.FC = () => {
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDownloadingOfficial, setIsDownloadingOfficial] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local'>('idle');
  const printRef = useRef<HTMLDivElement>(null);

  const handleXmlLoaded = async (xmlContent: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = parseXmlContent(xmlContent);
      setDocData(parsed);
      setSyncStatus('syncing');

      // Tentar registrar na API de forma transparente para permitir baixar PDF Oficial depois
      const synced = await registerXmlOnApi(xmlContent);
      setSyncStatus(synced ? 'synced' : 'local');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo XML.');
      setDocData(null);
      setSyncStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySubmit = async (key: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await fetchNfeDataByKey(key);
      setDocData(parsed);
      setSyncStatus('synced');
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar chave na SEFAZ.');
      setDocData(null);
      setSyncStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDocData(null);
    setError(null);
    setSyncStatus('idle');
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

  const handleDownloadOfficialPdf = async () => {
    if (!docData?.accessKey) return;
    setIsDownloadingOfficial(true);
    try {
      const blobUrl = await fetchOfficialPdf(docData.accessKey);
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Não foi possível baixar o PDF Oficial da SEFAZ neste momento. Você pode usar a opção "Salvar PDF" para gerar o documento visual.');
    } finally {
      setIsDownloadingOfficial(false);
    }
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
        backgroundColor: '#ffffff',
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
          <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> NF-e (DANFE Modelo 55) & CT-e (DACTE Modelo 57)
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                DANFE Generator Pro
              </h2>
              <p className="text-sm text-slate-400">
                Visualize, audite tributos e gere o PDF oficial de notas fiscais e conhecimentos de transporte
                por arquivo XML ou diretamente pela chave de acesso de 44 dígitos.
              </p>
            </div>

            <XmlUploader
              onXmlLoaded={handleXmlLoaded}
              onKeySubmit={handleKeySubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            
            {/* Top Dashboard Metadata Widgets */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Documento Ativo</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-black uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {docData.docType === 'nfe' ? 'NF-e 55' : 'CT-e 57'}
                  </span>
                  <p className="text-sm font-bold text-white truncate">{docData.emitente.name}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Chave / Referência</p>
                <p className="mt-1 text-xs font-mono font-bold text-slate-300 truncate">
                  {formatAccessKey(docData.accessKey) || docData.accessKey}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Sincronização</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{syncStatus === 'synced' ? 'Salvo na API' : 'Processado no Cliente'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                >
                  Nova Consulta
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {docData.docType === 'nfe' ? 'DANFE' : 'DACTE'} Nº {docData.number} • Série {docData.series}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Destinatário: <strong className="text-slate-300">{docData.destinatario.name}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                  title="Copiar Chave de Acesso de 44 dígitos"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Chave'}</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl transition-colors"
                  title="Exportar dados estruturados em JSON"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handleDownloadOfficialPdf}
                  disabled={isDownloadingOfficial}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition-colors disabled:opacity-50"
                  title="Baixar o arquivo PDF Oficial emitido pela SEFAZ"
                >
                  {isDownloadingOfficial ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  <span>{isDownloadingOfficial ? 'Buscando...' : 'PDF Oficial'}</span>
                </button>

                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition-colors disabled:opacity-50"
                  title="Salvar o PDF visual A4 renderizado"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Gerando...' : 'Salvar PDF'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors"
                  title="Imprimir documento oficial em folha A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir A4</span>
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
        <p>Desenvolvido por <strong>Marcelo Bezerra</strong> • Leitor Fiscal Oficial de Alta Performance.</p>
      </footer>
    </div>
  );
};

export default App;
