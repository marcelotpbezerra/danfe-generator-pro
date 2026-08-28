import React from 'react';
import { NfeData } from '../types/fiscal';
import { formatCurrency, formatCPFCNPJ, formatAccessKey } from '../services/fiscalParser';

interface DanfeViewProps {
  data: NfeData;
}

export const DanfeView: React.FC<DanfeViewProps> = ({ data }) => {
  const { emitente, destinatario, products, totals, infoAdic } = data;

  return (
    <div className="bg-white text-black p-6 sm:p-8 font-sans text-xs border border-slate-300 shadow-xl max-w-4xl mx-auto printable-doc leading-tight">
      
      {/* Header Grid */}
      <div className="border border-black flex flex-col sm:flex-row">
        {/* Emitente */}
        <div className="p-3 border-b sm:border-b-0 sm:border-r border-black flex-1 flex flex-col justify-center">
          <h2 className="font-bold text-sm uppercase tracking-wide">{emitente.name || 'EMITENTE'}</h2>
          <p className="mt-1 text-[10px] text-gray-700">
            {emitente.address.street}, {emitente.address.number} - {emitente.address.neighborhood}
          </p>
          <p className="text-[10px] text-gray-700">
            {emitente.address.city} / {emitente.address.state} - CEP: {emitente.address.zip}
          </p>
          {emitente.address.phone && (
            <p className="text-[10px] text-gray-700">Fone: {emitente.address.phone}</p>
          )}
        </div>

        {/* DANFE Identifier */}
        <div className="p-3 border-b sm:border-b-0 sm:border-r border-black w-full sm:w-36 text-center flex flex-col justify-center items-center">
          <h1 className="font-black text-base tracking-wider">DANFE</h1>
          <p className="text-[9px] font-semibold">Documento Auxiliar da Nota Fiscal Eletrônica</p>
          <div className="my-1.5 flex gap-2 text-[10px] font-bold">
            <span>0 - ENTRADA</span>
            <span>1 - SAÍDA</span>
          </div>
          <div className="border border-black w-6 h-6 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <p className="mt-1 font-bold text-[11px]">Nº {data.number}</p>
          <p className="text-[10px]">SÉRIE {data.series}</p>
        </div>

        {/* Chave de Acesso & Barcode */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase text-gray-600 block">Chave de Acesso</span>
            <p className="font-mono text-xs font-bold tracking-wider break-all bg-gray-50 p-1 border border-gray-200 text-center">
              {formatAccessKey(data.accessKey) || data.accessKey}
            </p>
          </div>
          <div className="mt-2 text-[10px]">
            <span className="font-bold">Protocolo de Autorização: </span>
            <span>{data.protocol || 'Autorizada em contingência'}</span>
          </div>
        </div>
      </div>

      {/* Natureza da Operação */}
      <div className="border-x border-b border-black grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black p-1.5 bg-gray-50 text-[10px]">
        <div>
          <span className="font-bold block text-gray-600">Natureza da Operação</span>
          <span className="font-semibold">{data.naturezaOperacao}</span>
        </div>
        <div>
          <span className="font-bold block text-gray-600">Inscrição Estadual Emitente</span>
          <span>{emitente.ie || 'ISENTO'}</span>
        </div>
        <div>
          <span className="font-bold block text-gray-600">CNPJ do Emitente</span>
          <span className="font-mono">{formatCPFCNPJ(emitente.taxId)}</span>
        </div>
      </div>

      {/* Destinatário */}
      <div className="mt-2 border border-black">
        <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase border-b border-black">
          Destinatário / Remetente
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black p-1.5 text-[10px]">
          <div className="sm:col-span-2">
            <span className="font-bold block text-gray-600">Nome / Razão Social</span>
            <span className="font-semibold">{destinatario.name}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600">CNPJ / CPF</span>
            <span className="font-mono">{formatCPFCNPJ(destinatario.taxId)}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600">Data de Emissão</span>
            <span>{data.issueDate ? new Date(data.issueDate).toLocaleDateString('pt-BR') : '-'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black border-t border-black p-1.5 text-[10px]">
          <div className="sm:col-span-2">
            <span className="font-bold block text-gray-600">Endereço</span>
            <span>{destinatario.address.street}, {destinatario.address.number} - {destinatario.address.neighborhood}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600">Município / UF</span>
            <span>{destinatario.address.city} / {destinatario.address.state}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600">CEP</span>
            <span>{destinatario.address.zip}</span>
          </div>
        </div>
      </div>

      {/* Cálculo do Imposto */}
      <div className="mt-2 border border-black">
        <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase border-b border-black">
          Cálculo do Imposto
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-black p-1 text-[10px] text-right">
          <div>
            <span className="font-bold block text-gray-600 text-left">Base Cálc. ICMS</span>
            <span>{formatCurrency(totals.bcIcms)}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600 text-left">Valor ICMS</span>
            <span>{formatCurrency(totals.valIcms)}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600 text-left">Base ICMS ST</span>
            <span>{formatCurrency(totals.bcIcmsSt)}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600 text-left">Valor ICMS ST</span>
            <span>{formatCurrency(totals.valIcmsSt)}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-600 text-left">Total Produtos</span>
            <span>{formatCurrency(totals.valProducts)}</span>
          </div>
          <div className="bg-blue-50 font-bold">
            <span className="font-bold block text-blue-900 text-left">Total da Nota</span>
            <span className="text-blue-950 font-bold">{formatCurrency(totals.valTotal)}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos / Serviços */}
      <div className="mt-2 border border-black">
        <div className="bg-gray-200 px-2 py-0.5 font-bold text-[10px] uppercase border-b border-black">
          Dados dos Produtos / Serviços
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead className="bg-gray-100 border-b border-black">
              <tr>
                <th className="p-1 border-r border-black">Cód.</th>
                <th className="p-1 border-r border-black">Descrição</th>
                <th className="p-1 border-r border-black">NCM</th>
                <th className="p-1 border-r border-black">CST</th>
                <th className="p-1 border-r border-black">CFOP</th>
                <th className="p-1 border-r border-black">UN</th>
                <th className="p-1 border-r border-black text-right">Qtd</th>
                <th className="p-1 border-r border-black text-right">V. Unit</th>
                <th className="p-1 text-right">V. Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {products.map((prod, idx) => (
                <tr key={idx}>
                  <td className="p-1 border-r border-gray-300 font-mono">{prod.code}</td>
                  <td className="p-1 border-r border-gray-300 font-medium">{prod.description}</td>
                  <td className="p-1 border-r border-gray-300 font-mono">{prod.ncm}</td>
                  <td className="p-1 border-r border-gray-300 font-mono">{prod.cst}</td>
                  <td className="p-1 border-r border-gray-300 font-mono">{prod.cfop}</td>
                  <td className="p-1 border-r border-gray-300 text-center">{prod.unit}</td>
                  <td className="p-1 border-r border-gray-300 text-right">{prod.quantity}</td>
                  <td className="p-1 border-r border-gray-300 text-right">{formatCurrency(prod.unitValue)}</td>
                  <td className="p-1 text-right font-semibold">{formatCurrency(prod.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações Complementares */}
      {infoAdic && (
        <div className="mt-2 border border-black p-2 text-[9px] bg-gray-50">
          <span className="font-bold block uppercase text-gray-700">Informações Complementares:</span>
          <p className="mt-0.5 whitespace-pre-line text-gray-800">{infoAdic}</p>
        </div>
      )}
    </div>
  );
};
