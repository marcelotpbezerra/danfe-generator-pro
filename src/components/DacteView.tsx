import React, { useEffect, useRef } from 'react';
import { CteData } from '../types/fiscal';
import { formatCurrency, formatCPFCNPJ, formatAccessKey } from '../services/fiscalParser';
import JsBarcode from 'jsbarcode';

interface DacteViewProps {
  data: CteData;
}

export const DacteView: React.FC<DacteViewProps> = ({ data }) => {
  const {
    emitente,
    remetente,
    destinatario,
    tomador,
    recebedor,
    expedidor,
    icms,
    infoAdic,
  } = data;
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && data.accessKey) {
      try {
        JsBarcode(barcodeRef.current, data.accessKey.replace(/\D/g, ''), {
          format: 'CODE128',
          width: 1.1,
          height: 38,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.warn('Erro ao gerar código de barras DACTE:', err);
      }
    }
  }, [data.accessKey]);

  const modalMap: Record<string, string> = {
    '01': '01 - Rodoviário',
    '02': '02 - Aéreo',
    '03': '03 - Aquaviário',
    '04': '04 - Ferroviário',
    '05': '05 - Dutoviário',
    '06': '06 - Multimodal',
  };

  const formattedDate = (d?: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
  const formattedTime = (d?: string) => (d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-');

  return (
    <div className="bg-white text-black p-4 sm:p-6 font-sans text-[10px] border border-gray-400 shadow-2xl max-w-[210mm] mx-auto printable-doc leading-tight text-left">
      
      {/* 1. CABEÇALHO / EMITENTE / DACTE */}
      <div className="border border-black">
        <div className="grid grid-cols-12 divide-x divide-black">
          {/* Identificação da Transportadora / Emitente */}
          <div className="col-span-5 p-2 flex flex-col justify-center text-center">
            <span className="text-[8px] font-bold text-gray-500 uppercase">Transportador Emitente</span>
            <h2 className="font-black text-sm uppercase leading-tight tracking-wide mt-0.5">{emitente.name}</h2>
            <p className="mt-1 text-[9px] text-gray-800">
              {emitente.address.street}, {emitente.address.number} - {emitente.address.neighborhood || ''}
            </p>
            <p className="text-[9px] text-gray-800">
              {emitente.address.city} / {emitente.address.state} - CEP: {emitente.address.zip}
            </p>
            <p className="text-[9px] font-mono mt-0.5 font-bold">
              CNPJ: {formatCPFCNPJ(emitente.taxId)} • IE: {emitente.ie || 'ISENTO'}
            </p>
          </div>

          {/* Bloco DACTE */}
          <div className="col-span-2 p-1.5 text-center flex flex-col justify-between items-center">
            <div>
              <h1 className="font-black text-sm tracking-wider">DACTE</h1>
              <p className="text-[7.5px] leading-tight">Documento Auxiliar do Conhecimento de Transporte Eletrônico</p>
            </div>
            
            <div className="my-1 border border-black px-1.5 py-0.5 text-center text-[8.5px] bg-gray-50 font-bold">
              MODAL: {modalMap[data.modal] || data.modal}
            </div>

            <div>
              <p className="font-bold text-[10px]">Nº {data.number}</p>
              <p className="text-[9px]">SÉRIE {data.series} • MOD {data.model}</p>
            </div>
          </div>

          {/* Barcode e Chave de Acesso */}
          <div className="col-span-5 p-1.5 flex flex-col justify-between">
            <div className="flex justify-center items-center h-10 overflow-hidden">
              <svg ref={barcodeRef} className="w-full max-h-9"></svg>
            </div>
            <div className="mt-1 border border-gray-400 p-1 text-center bg-gray-50">
              <span className="text-[7.5px] uppercase font-bold text-gray-600 block leading-none">Chave de Acesso do CT-e</span>
              <span className="font-mono text-[9.5px] font-bold tracking-wider break-all">
                {formatAccessKey(data.accessKey) || data.accessKey}
              </span>
            </div>
            <p className="text-[7.5px] text-center text-gray-600 mt-1 leading-tight">
              Consulta de autenticidade no portal nacional do CT-e www.cte.fazenda.gov.br/portal ou no site da Sefaz
            </p>
          </div>
        </div>

        {/* Protocolo e Natureza */}
        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px] bg-gray-50">
          <div className="col-span-7">
            <span className="text-[7.5px] uppercase text-gray-600 block">Natureza da Operação</span>
            <span className="font-bold">{data.naturezaOperacao}</span>
          </div>
          <div className="col-span-5 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Protocolo de Autorização de Uso</span>
            <span className="font-bold">{data.protocol ? `${data.protocol} - ${formattedDate(data.issueDate)} ${formattedTime(data.issueDate)}` : 'Autorizado'}</span>
          </div>
        </div>
      </div>

      {/* 2. ROTA DA PRESTAÇÃO */}
      <div className="border border-black border-t-0 grid grid-cols-2 divide-x divide-black p-1.5 bg-gray-100 text-[10px]">
        <div>
          <span className="text-[7.5px] uppercase text-gray-600 font-bold block">Início da Prestação (Origem)</span>
          <span className="font-bold">{data.originCity} / {data.originState}</span>
        </div>
        <div className="pl-1">
          <span className="text-[7.5px] uppercase text-gray-600 font-bold block">Término da Prestação (Destino)</span>
          <span className="font-bold">{data.destCity} / {data.destState}</span>
        </div>
      </div>

      {/* 3. PARTES DO TRANSPORTE */}
      <div className="border border-black mt-1">
        <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
          Partes do Transporte
        </div>
        
        {/* Remetente e Destinatário */}
        <div className="grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-6 pr-1">
            <span className="font-bold text-blue-900 block text-[8px] uppercase">Remetente</span>
            <p className="font-bold">{remetente.name}</p>
            <p className="text-gray-700">{remetente.address.street}, {remetente.address.number} - {remetente.address.city}/{remetente.address.state}</p>
            <p className="font-mono text-gray-600">CNPJ/CPF: {formatCPFCNPJ(remetente.taxId)} • IE: {remetente.ie || 'ISENTO'}</p>
          </div>

          <div className="col-span-6 pl-1">
            <span className="font-bold text-blue-900 block text-[8px] uppercase">Destinatário</span>
            <p className="font-bold">{destinatario.name}</p>
            <p className="text-gray-700">{destinatario.address.street}, {destinatario.address.number} - {destinatario.address.city}/{destinatario.address.state}</p>
            <p className="font-mono text-gray-600">CNPJ/CPF: {formatCPFCNPJ(destinatario.taxId)} • IE: {destinatario.ie || 'ISENTO'}</p>
          </div>
        </div>

        {/* Expedidor / Recebedor (se houver) */}
        {(expedidor?.name || recebedor?.name) && (
          <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
            <div className="col-span-6 pr-1">
              <span className="font-bold text-gray-700 block text-[8px] uppercase">Expedidor</span>
              <p className="font-semibold">{expedidor?.name || '-'}</p>
              <p className="font-mono text-gray-600">{expedidor?.taxId ? `CNPJ/CPF: ${formatCPFCNPJ(expedidor.taxId)}` : ''}</p>
            </div>
            <div className="col-span-6 pl-1">
              <span className="font-bold text-gray-700 block text-[8px] uppercase">Recebedor</span>
              <p className="font-semibold">{recebedor?.name || '-'}</p>
              <p className="font-mono text-gray-600">{recebedor?.taxId ? `CNPJ/CPF: ${formatCPFCNPJ(recebedor.taxId)}` : ''}</p>
            </div>
          </div>
        )}

        {/* Tomador do Serviço */}
        <div className="border-t border-black p-1 bg-blue-50/70 text-[9px]">
          <span className="font-bold text-blue-950 block text-[8px] uppercase">Tomador do Serviço (Responsável pelo Pagamento)</span>
          <div className="flex flex-wrap justify-between gap-1 mt-0.5">
            <span className="font-bold">{tomador.name}</span>
            <span className="font-mono text-gray-800 font-semibold">CNPJ/CPF: {formatCPFCNPJ(tomador.taxId)}</span>
            <span>{tomador.address.city}/{tomador.address.state}</span>
          </div>
        </div>
      </div>

      {/* 4. VALORES DA PRESTAÇÃO E CARGA */}
      <div className="border border-black mt-1 grid grid-cols-12 divide-x divide-black">
        {/* Valores da Prestação */}
        <div className="col-span-6 p-1">
          <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase -m-1 mb-1 border-b border-black">
            Valores do Serviço de Transporte
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-gray-200 text-[10px]">
            <span className="font-semibold">Valor Total da Prestação:</span>
            <span className="font-black text-blue-950">{formatCurrency(data.valorTotalPrestacao)}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 text-[10px]">
            <span className="font-semibold">Valor a Receber:</span>
            <span className="font-black text-emerald-950">{formatCurrency(data.valorReceber)}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1 pt-1 border-t border-gray-300 text-[8px] bg-gray-50 p-1 text-center">
            <div>
              <span className="text-gray-500 block">Base ICMS</span>
              <span className="font-bold">{formatCurrency(icms.vBC)}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Alíq. ICMS</span>
              <span className="font-bold">{icms.pICMS}%</span>
            </div>
            <div>
              <span className="text-gray-500 block">Valor ICMS</span>
              <span className="font-bold">{formatCurrency(icms.vICMS)}</span>
            </div>
          </div>
        </div>

        {/* Informações da Carga */}
        <div className="col-span-6 p-1">
          <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase -m-1 mb-1 border-b border-black">
            Informações da Carga
          </div>
          <div className="space-y-0.5 text-[9px]">
            <div>
              <span className="text-gray-600 block text-[8px]">Produto Predominante:</span>
              <span className="font-bold uppercase">{data.produtoPredominante}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor da Carga:</span>
              <span className="font-semibold">{formatCurrency(data.valorCarga)}</span>
            </div>
            <div className="flex justify-between">
              <span>Peso Bruto:</span>
              <span className="font-semibold">{data.pesoBruto > 0 ? `${data.pesoBruto} kg` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Volumes:</span>
              <span className="font-semibold">{data.volumes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. INFORMAÇÕES COMPLEMENTARES */}
      {infoAdic && (
        <div className="border border-black mt-1 p-1 text-[8px] bg-gray-50">
          <span className="font-bold block uppercase text-gray-700">Observações / Informações Complementares:</span>
          <p className="mt-0.5 whitespace-pre-line text-gray-800 leading-tight">{infoAdic}</p>
        </div>
      )}
    </div>
  );
};
