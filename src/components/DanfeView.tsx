import React, { useEffect, useRef } from 'react';
import { NfeData } from '../types/fiscal';
import { formatCurrency, formatCurrencyNumber, formatCPFCNPJ, formatAccessKey } from '../services/fiscalParser';
import JsBarcode from 'jsbarcode';

interface DanfeViewProps {
  data: NfeData;
}

export const DanfeView: React.FC<DanfeViewProps> = ({ data }) => {
  const { emitente, destinatario, products, totals, duplicatas, transport, infoAdic } = data;
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
        console.warn('Erro ao gerar código de barras:', err);
      }
    }
  }, [data.accessKey]);

  const formattedDate = (d?: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '-');
  const formattedTime = (d?: string) => (d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-');

  return (
    <div className="bg-white text-black p-4 sm:p-6 font-sans text-[10px] border border-gray-400 shadow-2xl max-w-[210mm] mx-auto printable-doc leading-tight text-left">
      
      {/* 1. CANHOTO DE RECEBIMENTO */}
      <div className="border border-black mb-1 p-1">
        <div className="flex border-b border-black pb-1 mb-1">
          <div className="flex-1 text-[8px] leading-tight pr-2">
            RECEBEMOS DE <strong>{emitente.name}</strong> OS PRODUTOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO. 
            EMISSÃO: {formattedDate(data.issueDate)} • VALOR TOTAL: {formatCurrency(totals.valTotal)} • 
            DESTINATÁRIO: {destinatario.name} - {destinatario.address.street}, {destinatario.address.number}, {destinatario.address.city}/{destinatario.address.state}
          </div>
          <div className="w-24 text-center border-l border-black pl-1 flex flex-col justify-center">
            <span className="font-black text-xs">NF-e</span>
            <span className="font-bold text-[9px]">Nº {data.number}</span>
            <span className="text-[8px]">SÉRIE {data.series}</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1 text-[8px]">
          <div className="col-span-3 border-r border-black pr-1">
            <span className="block text-gray-600">DATA DE RECEBIMENTO</span>
            <div className="h-4"></div>
          </div>
          <div className="col-span-9 pl-1">
            <span className="block text-gray-600">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
            <div className="h-4"></div>
          </div>
        </div>
      </div>

      {/* LINHA PONTILHADA DE CORTE */}
      <div className="border-b border-dashed border-gray-500 my-1.5"></div>

      {/* 2. CABEÇALHO / EMITENTE / DANFE / CHAVE DE ACESSO */}
      <div className="border border-black">
        <div className="grid grid-cols-12 divide-x divide-black">
          {/* Identificação do Emitente */}
          <div className="col-span-5 p-2 flex flex-col justify-center text-center">
            <h2 className="font-black text-sm uppercase leading-tight tracking-wide">{emitente.name}</h2>
            <p className="mt-1 text-[9px] text-gray-800">
              {emitente.address.street}, {emitente.address.number}
              {emitente.address.neighborhood ? ` - ${emitente.address.neighborhood}` : ''}
            </p>
            <p className="text-[9px] text-gray-800">
              {emitente.address.city} / {emitente.address.state} - CEP: {emitente.address.zip}
            </p>
            {emitente.address.phone && (
              <p className="text-[9px] text-gray-800">Fone: {emitente.address.phone}</p>
            )}
          </div>

          {/* Bloco DANFE */}
          <div className="col-span-2 p-1.5 text-center flex flex-col justify-between items-center">
            <div>
              <h1 className="font-black text-sm tracking-wider">DANFE</h1>
              <p className="text-[7.5px] leading-tight">Documento Auxiliar da<br />Nota Fiscal Eletrônica</p>
            </div>
            
            <div className="my-1 border border-black px-2 py-0.5 text-center flex items-center gap-1.5 text-[8.5px]">
              <span className="leading-none">0 - ENTRADA<br />1 - SAÍDA</span>
              <span className="border border-black px-1.5 py-0.5 font-bold text-xs">1</span>
            </div>

            <div>
              <p className="font-bold text-[10px]">Nº {data.number}</p>
              <p className="text-[9px]">SÉRIE {data.series}</p>
            </div>
          </div>

          {/* Barcode e Chave de Acesso */}
          <div className="col-span-5 p-1.5 flex flex-col justify-between">
            <div className="flex justify-center items-center h-10 overflow-hidden">
              <svg ref={barcodeRef} className="w-full max-h-9"></svg>
            </div>
            <div className="mt-1 border border-gray-400 p-1 text-center bg-gray-50">
              <span className="text-[7.5px] uppercase font-bold text-gray-600 block leading-none">Chave de Acesso</span>
              <span className="font-mono text-[9.5px] font-bold tracking-wider break-all">
                {formatAccessKey(data.accessKey) || data.accessKey}
              </span>
            </div>
            <p className="text-[7.5px] text-center text-gray-600 mt-1 leading-tight">
              Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
            </p>
          </div>
        </div>

        {/* Natureza da Operação e Protocolo */}
        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px] bg-gray-50">
          <div className="col-span-7">
            <span className="text-[7.5px] uppercase text-gray-600 block">Natureza da Operação</span>
            <span className="font-bold">{data.naturezaOperacao}</span>
          </div>
          <div className="col-span-5 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Protocolo de Autorização de Uso</span>
            <span className="font-bold">{data.protocol ? `${data.protocol} - ${formattedDate(data.issueDate)}` : 'Autorizada'}</span>
          </div>
        </div>

        {/* Inscrições e CNPJ */}
        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-4">
            <span className="text-[7.5px] uppercase text-gray-600 block">Inscrição Estadual</span>
            <span className="font-semibold">{emitente.ie || 'ISENTO'}</span>
          </div>
          <div className="col-span-4 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Inscrição Estadual do Subst. Trib.</span>
            <span>-</span>
          </div>
          <div className="col-span-4 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">CNPJ / CPF Emitente</span>
            <span className="font-mono font-bold">{formatCPFCNPJ(emitente.taxId)}</span>
          </div>
        </div>
      </div>

      {/* 3. DESTINATÁRIO / REMETENTE */}
      <div className="border border-black mt-1">
        <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
          Destinatário / Remetente
        </div>
        <div className="grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-7">
            <span className="text-[7.5px] uppercase text-gray-600 block">Nome / Razão Social</span>
            <span className="font-bold uppercase">{destinatario.name}</span>
          </div>
          <div className="col-span-3 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">CNPJ / CPF</span>
            <span className="font-mono">{formatCPFCNPJ(destinatario.taxId)}</span>
          </div>
          <div className="col-span-2 pl-1 text-center">
            <span className="text-[7.5px] uppercase text-gray-600 block">Data de Emissão</span>
            <span className="font-semibold">{formattedDate(data.issueDate)}</span>
          </div>
        </div>

        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-6">
            <span className="text-[7.5px] uppercase text-gray-600 block">Endereço</span>
            <span>{destinatario.address.street}, {destinatario.address.number}</span>
          </div>
          <div className="col-span-4 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Bairro / Distrito</span>
            <span>{destinatario.address.neighborhood || '-'}</span>
          </div>
          <div className="col-span-2 pl-1 text-center">
            <span className="text-[7.5px] uppercase text-gray-600 block">CEP</span>
            <span>{destinatario.address.zip}</span>
          </div>
        </div>

        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-5">
            <span className="text-[7.5px] uppercase text-gray-600 block">Município</span>
            <span>{destinatario.address.city}</span>
          </div>
          <div className="col-span-1 pl-1 text-center">
            <span className="text-[7.5px] uppercase text-gray-600 block">UF</span>
            <span>{destinatario.address.state}</span>
          </div>
          <div className="col-span-3 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Inscrição Estadual</span>
            <span>{destinatario.ie || 'ISENTO'}</span>
          </div>
          <div className="col-span-3 pl-1 text-center">
            <span className="text-[7.5px] uppercase text-gray-600 block">Hora da Saída</span>
            <span>{formattedTime(data.issueDate)}</span>
          </div>
        </div>
      </div>

      {/* 4. FATURA / DUPLICATAS */}
      {duplicatas && duplicatas.length > 0 && (
        <div className="border border-black mt-1">
          <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
            Fatura / Duplicatas
          </div>
          <div className="flex flex-wrap gap-2 p-1 text-[9px]">
            {duplicatas.map((dup, idx) => (
              <div key={idx} className="border border-gray-400 p-1 rounded bg-gray-50 flex-1 min-w-[120px]">
                <span className="text-[7.5px] text-gray-600 block">Número: <strong>{dup.number}</strong></span>
                <span className="text-[7.5px] text-gray-600 block">Vencimento: <strong>{formattedDate(dup.dueDate)}</strong></span>
                <span className="text-[8.5px] font-bold text-blue-950 block">Valor: {formatCurrency(dup.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CÁLCULO DO IMPOSTO */}
      <div className="border border-black mt-1">
        <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
          Cálculo do Imposto
        </div>
        <div className="grid grid-cols-10 divide-x divide-black p-1 text-[8.5px] text-right">
          <div className="col-span-2 pr-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Base Cálc. ICMS</span>
            <span className="font-semibold">{formatCurrency(totals.bcIcms)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Valor do ICMS</span>
            <span className="font-semibold">{formatCurrency(totals.valIcms)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Base Cálc. ICMS ST</span>
            <span className="font-semibold">{formatCurrency(totals.bcIcmsSt)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Valor do ICMS ST</span>
            <span className="font-semibold">{formatCurrency(totals.valIcmsSt)}</span>
          </div>
          <div className="col-span-2 pl-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">V. Total Produtos</span>
            <span className="font-semibold">{formatCurrency(totals.valProducts)}</span>
          </div>
        </div>

        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[8.5px] text-right">
          <div className="col-span-2 pr-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Valor Frete</span>
            <span>{formatCurrency(totals.valFreight)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Valor Seguro</span>
            <span>{formatCurrency(totals.valInsurance)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Desconto</span>
            <span>{formatCurrency(totals.valDiscount)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Outras Desp.</span>
            <span>{formatCurrency(totals.valOther)}</span>
          </div>
          <div className="col-span-2 px-1 text-left">
            <span className="text-[7.5px] uppercase text-gray-600 block">Valor IPI</span>
            <span>{formatCurrency(totals.valIpi)}</span>
          </div>
          <div className="col-span-2 pl-1 bg-gray-100 font-bold text-left">
            <span className="text-[7.5px] uppercase text-black block">Total da Nota</span>
            <span className="text-black font-black text-[10px]">{formatCurrency(totals.valTotal)}</span>
          </div>
        </div>
      </div>

      {/* 6. TRANSPORTADOR / VOLUMES TRANSPORTADOS */}
      <div className="border border-black mt-1">
        <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
          Transportador / Volumes Transportados
        </div>
        <div className="grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-5">
            <span className="text-[7.5px] uppercase text-gray-600 block">Razão Social</span>
            <span className="font-semibold uppercase">{transport.name || 'O MESMO / RETIRA'}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Frete por Conta</span>
            <span>{transport.modFrete === '0' ? '0-Emitente' : transport.modFrete === '1' ? '1-Destinatário' : '9-Sem Frete'}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Placa do Veículo</span>
            <span>{transport.vehiclePlate || '-'}</span>
          </div>
          <div className="col-span-1 pl-1 text-center">
            <span className="text-[7.5px] uppercase text-gray-600 block">UF</span>
            <span>{transport.vehicleState || '-'}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">CNPJ / CPF</span>
            <span className="font-mono">{formatCPFCNPJ(transport.taxId || '')}</span>
          </div>
        </div>

        <div className="border-t border-black grid grid-cols-12 divide-x divide-black p-1 text-[9px]">
          <div className="col-span-2">
            <span className="text-[7.5px] uppercase text-gray-600 block">Quantidade</span>
            <span>{transport.volumeQuantity || products.length}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Espécie</span>
            <span>{transport.volumeSpecies || 'VOLUMES'}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Marca</span>
            <span>{transport.volumeBrand || '-'}</span>
          </div>
          <div className="col-span-2 pl-1">
            <span className="text-[7.5px] uppercase text-gray-600 block">Numeração</span>
            <span>{transport.volumeNumber || '-'}</span>
          </div>
          <div className="col-span-2 pl-1 text-right">
            <span className="text-[7.5px] uppercase text-gray-600 block">Peso Bruto</span>
            <span>{transport.grossWeight ? `${transport.grossWeight} kg` : '-'}</span>
          </div>
          <div className="col-span-2 pl-1 text-right">
            <span className="text-[7.5px] uppercase text-gray-600 block">Peso Líquido</span>
            <span>{transport.netWeight ? `${transport.netWeight} kg` : '-'}</span>
          </div>
        </div>
      </div>

      {/* 7. DADOS DOS PRODUTOS / SERVIÇOS */}
      <div className="border border-black mt-1">
        <div className="bg-gray-200 px-1 py-0.5 font-bold text-[8.5px] uppercase border-b border-black">
          Dados dos Produtos / Serviços
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[8px] border-collapse">
            <thead className="bg-gray-100 border-b border-black">
              <tr>
                <th className="p-0.5 border-r border-black w-14">CÓDIGO</th>
                <th className="p-0.5 border-r border-black">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                <th className="p-0.5 border-r border-black w-12 text-center">NCM/SH</th>
                <th className="p-0.5 border-r border-black w-8 text-center">CST</th>
                <th className="p-0.5 border-r border-black w-8 text-center">CFOP</th>
                <th className="p-0.5 border-r border-black w-6 text-center">UN</th>
                <th className="p-0.5 border-r border-black w-10 text-right">QTD.</th>
                <th className="p-0.5 border-r border-black w-12 text-right">V. UNIT.</th>
                <th className="p-0.5 border-r border-black w-12 text-right">V. TOTAL</th>
                <th className="p-0.5 border-r border-black w-12 text-right">BC ICMS</th>
                <th className="p-0.5 border-r border-black w-10 text-right">V. ICMS</th>
                <th className="p-0.5 border-r border-black w-8 text-center">ALÍQ ICMS</th>
                <th className="p-0.5 text-right w-10">V. IPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {products.map((prod, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-0.5 border-r border-gray-300 font-mono text-[7.5px]">{prod.code}</td>
                  <td className="p-0.5 border-r border-gray-300 font-semibold">{prod.description}</td>
                  <td className="p-0.5 border-r border-gray-300 font-mono text-center">{prod.ncm}</td>
                  <td className="p-0.5 border-r border-gray-300 font-mono text-center">{prod.cst}</td>
                  <td className="p-0.5 border-r border-gray-300 font-mono text-center">{prod.cfop}</td>
                  <td className="p-0.5 border-r border-gray-300 text-center uppercase">{prod.unit}</td>
                  <td className="p-0.5 border-r border-gray-300 text-right font-mono">{prod.quantity}</td>
                  <td className="p-0.5 border-r border-gray-300 text-right font-mono">{formatCurrencyNumber(prod.unitValue)}</td>
                  <td className="p-0.5 border-r border-gray-300 text-right font-bold font-mono">{formatCurrencyNumber(prod.totalValue)}</td>
                  <td className="p-0.5 border-r border-gray-300 text-right font-mono">{prod.bcIcms ? formatCurrencyNumber(prod.bcIcms) : '-'}</td>
                  <td className="p-0.5 border-r border-gray-300 text-right font-mono">{prod.valIcms ? formatCurrencyNumber(prod.valIcms) : '-'}</td>
                  <td className="p-0.5 border-r border-gray-300 text-center font-mono">{prod.aliqIcms ? `${prod.aliqIcms}%` : '-'}</td>
                  <td className="p-0.5 text-right font-mono">{prod.valIpi ? formatCurrencyNumber(prod.valIpi) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES */}
      <div className="border border-black mt-1 p-1 bg-gray-50 text-[8px]">
        <span className="font-bold block uppercase text-gray-700">DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES:</span>
        <p className="mt-0.5 whitespace-pre-line text-gray-900 leading-tight">
          {infoAdic || 'Documento emitido por ME ou EPP optante pelo Simples Nacional ou regime normal.'}
        </p>
      </div>

    </div>
  );
};
