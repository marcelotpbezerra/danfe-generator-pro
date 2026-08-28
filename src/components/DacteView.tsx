import React from 'react';
import { CteData } from '../types/fiscal';
import { formatCurrency, formatCPFCNPJ, formatAccessKey } from '../services/fiscalParser';

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

  return (
    <div className="bg-white text-black p-6 sm:p-8 font-sans text-xs border border-slate-300 shadow-xl max-w-4xl mx-auto printable-doc leading-tight">
      
      {/* Header Grid */}
      <div className="border border-black flex flex-col sm:flex-row">
        {/* Emitente / Transportadora */}
        <div className="p-3 border-b sm:border-b-0 sm:border-r border-black flex-1 flex flex-col justify-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase">Transportador / Emitente</span>
          <h2 className="font-bold text-sm uppercase tracking-wide mt-0.5">{emitente.name || 'TRANSPORTADORA'}</h2>
          <p className="mt-1 text-[10px] text-gray-700">
            {emitente.address.street}, {emitente.address.number} - {emitente.address.neighborhood}
          </p>
          <p className="text-[10px] text-gray-700">
            {emitente.address.city} / {emitente.address.state} - CEP: {emitente.address.zip}
          </p>
          <p className="text-[10px] text-gray-700 font-mono mt-0.5">
            CNPJ: {formatCPFCNPJ(emitente.taxId)} • IE: {emitente.ie || 'ISENTO'}
          </p>
        </div>

        {/* DACTE Identifier */}
        <div className="p-3 border-b sm:border-b-0 sm:border-r border-black w-full sm:w-40 text-center flex flex-col justify-center items-center">
          <h1 className="font-black text-base tracking-wider">DACTE</h1>
          <p className="text-[9px] font-semibold text-gray-700">Doc. Auxiliar do Conhecimento de Transporte Eletrônico</p>
          <div className="my-1.5 px-2 py-0.5 border border-black font-bold text-[10px] bg-gray-50">
            MODAL: {data.modal}
          </div>
          <p className="font-bold text-[11px]">Nº {data.number}</p>
          <p className="text-[10px]">SÉRIE {data.series} • MOD {data.model}</p>
        </div>

        {/* Chave de Acesso */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase text-gray-600 block">Chave de Acesso do CT-e</span>
            <p className="font-mono text-xs font-bold tracking-wider break-all bg-gray-50 p-1 border border-gray-200 text-center">
              {formatAccessKey(data.accessKey) || data.accessKey}
            </p>
          </div>
          <div className="mt-2 text-[10px]">
            <span className="font-bold">Protocolo de Autorização: </span>
            <span>{data.protocol || 'Autorizado'}</span>
          </div>
        </div>
      </div>

      {/* Rota da Prestação */}
      <div className="border-x border-b border-black grid grid-cols-2 divide-x divide-black p-2 bg-gray-100 text-[11px]">
        <div>
          <span className="font-bold block text-gray-600 text-[10px]">Início da Prestação (Origem)</span>
          <span className="font-bold">{data.originCity} / {data.originState}</span>
        </div>
        <div>
          <span className="font-bold block text-gray-600 text-[10px]">Término da Prestação (Destino)</span>
          <span className="font-bold">{data.destCity} / {data.destState}</span>
        </div>
      </div>

      {/* Envolvidos no Transporte */}
      <div className="mt-2 border border-black">
        <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase border-b border-black">
          Partes do Transporte
        </div>
        
        {/* Remetente e Destinatário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black p-2 text-[10px]">
          <div>
            <span className="font-bold text-blue-900 block uppercase">Remetente</span>
            <p className="font-semibold">{remetente.name}</p>
            <p className="text-gray-700">{remetente.address.street}, {remetente.address.number} - {remetente.address.city}/{remetente.address.state}</p>
            <p className="font-mono text-gray-600">CNPJ/CPF: {formatCPFCNPJ(remetente.taxId)} • IE: {remetente.ie || '-'}</p>
          </div>

          <div>
            <span className="font-bold text-blue-900 block uppercase">Destinatário</span>
            <p className="font-semibold">{destinatario.name}</p>
            <p className="text-gray-700">{destinatario.address.street}, {destinatario.address.number} - {destinatario.address.city}/{destinatario.address.state}</p>
            <p className="font-mono text-gray-600">CNPJ/CPF: {formatCPFCNPJ(destinatario.taxId)} • IE: {destinatario.ie || '-'}</p>
          </div>
        </div>

        {/* Tomador do Serviço */}
        <div className="border-t border-black p-2 bg-blue-50/50 text-[10px]">
          <span className="font-bold text-blue-950 block uppercase">Tomador do Serviço (Pagador do Frete)</span>
          <div className="flex flex-col sm:flex-row justify-between gap-1 mt-0.5">
            <span className="font-bold">{tomador.name}</span>
            <span className="font-mono text-gray-700">CNPJ/CPF: {formatCPFCNPJ(tomador.taxId)}</span>
            <span>{tomador.address.city}/{tomador.address.state}</span>
          </div>
        </div>
      </div>

      {/* Valores da Prestação e Carga */}
      <div className="mt-2 border border-black grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black">
        {/* Valores */}
        <div className="p-2">
          <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase -m-2 mb-2 border-b border-black">
            Valores do Serviço de Transporte
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200 text-[11px]">
            <span className="font-semibold">Valor Total da Prestação:</span>
            <span className="font-bold text-blue-950">{formatCurrency(data.valorTotalPrestacao)}</span>
          </div>
          <div className="flex justify-between items-center py-1 text-[11px]">
            <span className="font-semibold">Valor a Receber:</span>
            <span className="font-bold text-emerald-950">{formatCurrency(data.valorReceber)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-300 text-[9px] bg-gray-50 p-1 text-center">
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

        {/* Dados da Carga */}
        <div className="p-2">
          <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase -m-2 mb-2 border-b border-black">
            Informações da Carga
          </div>
          <div className="space-y-1 text-[10px]">
            <div>
              <span className="text-gray-600 block">Produto Predominante:</span>
              <span className="font-bold uppercase">{data.produtoPredominante}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor Total da Carga:</span>
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

      {/* Informações Complementares */}
      {infoAdic && (
        <div className="mt-2 border border-black p-2 text-[9px] bg-gray-50">
          <span className="font-bold block uppercase text-gray-700">Observações / Informações Complementares:</span>
          <p className="mt-0.5 whitespace-pre-line text-gray-800">{infoAdic}</p>
        </div>
      )}
    </div>
  );
};
