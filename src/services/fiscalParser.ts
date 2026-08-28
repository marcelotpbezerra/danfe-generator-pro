import { DocumentData, NfeData, CteData, NfeEntity, NfeProduct, NfeDuplicata, NfeTransport } from '../types/fiscal';

export const DEFAULT_API_KEY = 'd6d71dde-181d-4371-acd5-71f41ef4f197';
export const BASE_URL = 'https://api.meudanfe.com.br/v2';

export function getApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('MEUDANFE_API_KEY') || DEFAULT_API_KEY;
  }
  return DEFAULT_API_KEY;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export function formatCurrencyNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

export function formatCPFCNPJ(value: string): string {
  if (!value) return '';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

export function formatAccessKey(key: string): string {
  if (!key) return '';
  const clean = key.replace(/\D/g, '');
  return clean.replace(/(\d{4})/g, '$1 ').trim();
}

function getTag(parent: Element | Document | null | undefined, tag: string): string {
  if (!parent || typeof parent.getElementsByTagName !== 'function') return '';
  const el = parent.getElementsByTagName(tag)[0];
  return el ? (el.textContent || '').trim() : '';
}

function parseNum(value: string): number {
  return Number.parseFloat(value) || 0;
}

function extractEntity(parent: Element | Document, tagName: string): NfeEntity {
  const el = parent.getElementsByTagName(tagName)[0];
  if (!el) {
    return {
      name: '',
      taxId: '',
      address: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' },
    };
  }
  const addrEl =
    el.getElementsByTagName('enderEmit')[0] ||
    el.getElementsByTagName('enderDest')[0] ||
    el.getElementsByTagName('enderReme')[0] ||
    el.getElementsByTagName('enderExped')[0] ||
    el.getElementsByTagName('enderReceb')[0] ||
    el.getElementsByTagName('enderToma')[0] ||
    el;

  return {
    name: getTag(el, 'xNome'),
    taxId: getTag(el, 'CNPJ') || getTag(el, 'CPF'),
    ie: getTag(el, 'IE'),
    address: {
      street: getTag(addrEl, 'xLgr'),
      number: getTag(addrEl, 'nro'),
      neighborhood: getTag(addrEl, 'xBairro'),
      city: getTag(addrEl, 'xMun'),
      state: getTag(addrEl, 'UF'),
      zip: getTag(addrEl, 'CEP'),
      phone: getTag(addrEl, 'fone'),
    },
  };
}

export function parseNfeXml(doc: Document): NfeData {
  const emitente = extractEntity(doc, 'emit');
  const destinatario = extractEntity(doc, 'dest');
  const detList = doc.getElementsByTagName('det');
  const products: NfeProduct[] = [];

  for (let index = 0; index < detList.length; index += 1) {
    const prod = detList[index].getElementsByTagName('prod')[0];
    const imposto = detList[index].getElementsByTagName('imposto')[0];
    const icms = imposto?.getElementsByTagName('ICMS')[0];
    const icmsInner = icms?.children?.[0];
    const cst = icmsInner ? (getTag(icmsInner, 'CST') || getTag(icmsInner, 'CSOSN') || '000') : '000';
    const bcIcms = parseNum(getTag(icmsInner, 'vBC'));
    const valIcms = parseNum(getTag(icmsInner, 'vICMS'));
    const aliqIcms = parseNum(getTag(icmsInner, 'pICMS'));

    const ipi = imposto?.getElementsByTagName('IPI')[0];
    const ipiTrib = ipi?.getElementsByTagName('IPITrib')[0];
    const valIpi = parseNum(getTag(ipiTrib, 'vIPI'));
    const aliqIpi = parseNum(getTag(ipiTrib, 'pIPI'));

    products.push({
      code: getTag(prod, 'cProd'),
      description: getTag(prod, 'xProd'),
      ncm: getTag(prod, 'NCM'),
      cst,
      cfop: getTag(prod, 'CFOP'),
      unit: getTag(prod, 'uCom'),
      quantity: parseNum(getTag(prod, 'qCom')),
      unitValue: parseNum(getTag(prod, 'vUnCom')),
      totalValue: parseNum(getTag(prod, 'vProd')),
      bcIcms,
      valIcms,
      aliqIcms,
      valIpi,
      aliqIpi,
    });
  }

  const total = doc.getElementsByTagName('total')[0]?.getElementsByTagName('ICMSTot')[0];
  const infNFe = doc.getElementsByTagName('infNFe')[0];
  const ide = doc.getElementsByTagName('ide')[0];
  const transp = doc.getElementsByTagName('transp')[0];
  const transporta = transp?.getElementsByTagName('transporta')[0];
  const veicTransp = transp?.getElementsByTagName('veicTransp')[0];
  const vol = transp?.getElementsByTagName('vol')[0];

  const transport: NfeTransport = {
    modFrete: getTag(transp, 'modFrete') || '9',
    name: getTag(transporta, 'xNome'),
    taxId: getTag(transporta, 'CNPJ') || getTag(transporta, 'CPF'),
    ie: getTag(transporta, 'IE'),
    address: getTag(transporta, 'xEnder'),
    city: getTag(transporta, 'xMun'),
    state: getTag(transporta, 'UF'),
    vehiclePlate: getTag(veicTransp, 'placa'),
    vehicleState: getTag(veicTransp, 'UF'),
    rntrc: getTag(veicTransp, 'RNTRC'),
    volumeQuantity: parseNum(getTag(vol, 'qVol')),
    volumeSpecies: getTag(vol, 'esp'),
    volumeBrand: getTag(vol, 'marca'),
    volumeNumber: getTag(vol, 'nVol'),
    netWeight: parseNum(getTag(vol, 'pesoL')),
    grossWeight: parseNum(getTag(vol, 'pesoB')),
  };

  // Duplicatas
  const dupNodes = doc.getElementsByTagName('dup');
  const duplicatas: NfeDuplicata[] = [];
  for (let i = 0; i < dupNodes.length; i++) {
    duplicatas.push({
      number: getTag(dupNodes[i], 'nDup'),
      dueDate: getTag(dupNodes[i], 'dVenc'),
      value: parseNum(getTag(dupNodes[i], 'vDup')),
    });
  }

  let accessKey = infNFe?.getAttribute('Id')?.replace('NFe', '') || '';
  if (!accessKey) {
    accessKey = getTag(doc.getElementsByTagName('protNFe')[0], 'chNFe');
  }

  return {
    docType: 'nfe',
    accessKey,
    number: getTag(ide, 'nNF'),
    series: getTag(ide, 'serie'),
    naturezaOperacao: getTag(ide, 'natOp'),
    protocol: getTag(doc, 'nProt'),
    issueDate: getTag(ide, 'dhEmi'),
    emitente,
    destinatario,
    products,
    duplicatas,
    transport,
    totals: {
      bcIcms: parseNum(getTag(total, 'vBC')),
      valIcms: parseNum(getTag(total, 'vICMS')),
      bcIcmsSt: parseNum(getTag(total, 'vBCST')),
      valIcmsSt: parseNum(getTag(total, 'vST')),
      valPis: parseNum(getTag(total, 'vPIS')),
      valCofins: parseNum(getTag(total, 'vCOFINS')),
      valProducts: parseNum(getTag(total, 'vProd')),
      valFreight: parseNum(getTag(total, 'vFrete')),
      valInsurance: parseNum(getTag(total, 'vSeg')),
      valDiscount: parseNum(getTag(total, 'vDesc')),
      valOther: parseNum(getTag(total, 'vOutro')),
      valIpi: parseNum(getTag(total, 'vIPI')),
      valTotal: parseNum(getTag(total, 'vNF')),
    },
    infoAdic: getTag(doc.getElementsByTagName('infAdic')[0], 'infCpl'),
  };
}

export function parseCteXml(doc: Document): CteData {
  const infCte = doc.getElementsByTagName('infCte')[0];
  const ide = doc.getElementsByTagName('ide')[0];
  const vPrest = doc.getElementsByTagName('vPrest')[0];
  const infCarga = doc.getElementsByTagName('infCarga')[0];
  const emitente = extractEntity(doc, 'emit');
  const remetente = extractEntity(doc, 'rem');
  const destinatario = extractEntity(doc, 'dest');
  const expedidor = extractEntity(doc, 'exped');
  const recebedor = extractEntity(doc, 'receb');

  let tomador: NfeEntity = { name: 'Consulte XML', taxId: '', address: emitente.address };
  const toma3 = doc.getElementsByTagName('toma3')[0];
  const toma4 = doc.getElementsByTagName('toma4')[0];

  if (toma3) {
    const tomaTag = getTag(toma3, 'toma');
    if (tomaTag === '0') tomador = remetente;
    else if (tomaTag === '1') tomador = expedidor;
    else if (tomaTag === '2') tomador = recebedor;
    else if (tomaTag === '3') tomador = destinatario;
  } else if (toma4) {
    tomador = extractEntity(doc, 'toma4');
  }

  const imp = doc.getElementsByTagName('imp')[0];
  const icmsTag = imp?.getElementsByTagName('ICMS')[0];
  let icmsData = { cst: '', vBC: 0, pICMS: 0, vICMS: 0 };

  if (icmsTag && icmsTag.children.length > 0) {
    const icmsInner = icmsTag.children[0];
    icmsData = {
      cst: getTag(icmsInner, 'CST'),
      vBC: parseNum(getTag(icmsInner, 'vBC')),
      pICMS: parseNum(getTag(icmsInner, 'pICMS')),
      vICMS: parseNum(getTag(icmsInner, 'vICMS')),
    };
  }

  let accessKey = infCte?.getAttribute('Id')?.replace('CTe', '') || '';
  if (!accessKey) {
    accessKey = getTag(doc.getElementsByTagName('protCTe')[0], 'chCTe');
  }

  const pesoBruto = parseNum(getTag(doc, 'qCarga'));

  return {
    docType: 'cte',
    accessKey,
    number: getTag(ide, 'nCT'),
    series: getTag(ide, 'serie'),
    model: getTag(ide, 'mod') || '57',
    naturezaOperacao: getTag(ide, 'natOp'),
    protocol: getTag(doc, 'nProt'),
    issueDate: getTag(ide, 'dhEmi'),
    emitente,
    remetente,
    destinatario,
    recebedor,
    expedidor,
    tomador,
    valorTotalPrestacao: parseNum(getTag(vPrest, 'vTPrest')),
    valorReceber: parseNum(getTag(vPrest, 'vRec')),
    icms: icmsData,
    produtoPredominante: getTag(infCarga, 'proPred') || 'CARGA GERAL',
    valorCarga: parseNum(getTag(infCarga, 'vCarga')),
    pesoBruto: pesoBruto || 0,
    pesoCubado: 0,
    volumes: parseNum(getTag(doc, 'qVol')) || 1,
    medidas: '',
    modal: getTag(ide, 'modal') || '01',
    originCity: getTag(ide, 'xMunIni'),
    originState: getTag(ide, 'UFIni'),
    destCity: getTag(ide, 'xMunFim'),
    destState: getTag(ide, 'UFFim'),
    infoAdic: getTag(doc.getElementsByTagName('compl')[0], 'xObs'),
  };
}

export function parseXmlContent(xmlContent: string): DocumentData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  const parseError = doc.getElementsByTagName('parsererror');
  if (parseError.length > 0) {
    throw new Error('O arquivo XML fornecido é inválido ou está corrompido.');
  }
  if (doc.getElementsByTagName('infNFe').length > 0 || doc.getElementsByTagName('nfeProc').length > 0) {
    return parseNfeXml(doc);
  }
  if (doc.getElementsByTagName('infCte').length > 0 || doc.getElementsByTagName('cteProc').length > 0) {
    return parseCteXml(doc);
  }
  throw new Error('Tipo de documento não suportado. Por favor, envie um XML válido de NF-e ou CT-e.');
}

export function decodeBase64(input: string): string {
  if (!input) return '';
  if (input.trim().startsWith('<')) return input;
  let clean = input.replace(/^data:.*;base64,/, '').replace(/\s/g, '');
  if (clean.length % 4 !== 0) {
    clean += '='.repeat(4 - (clean.length % 4));
  }
  try {
    const binary = atob(clean);
    return decodeURIComponent(
      binary
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
  } catch {
    return atob(clean);
  }
}

export function base64ToBlob(base64: string, mimeType = 'application/pdf'): Blob {
  let clean = base64.replace(/^data:.*;base64,/, '').replace(/\s/g, '');
  if (clean.length % 4 !== 0) {
    clean += '='.repeat(4 - (clean.length % 4));
  }
  const byteCharacters = atob(clean);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export async function fetchOfficialPdf(accessKey: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Chave de API não configurada.');

  const response = await fetch(`${BASE_URL}/fd/get/da/${accessKey}`, {
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao obter PDF Oficial (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const pdfBase64 = json.data || (typeof json === 'string' ? json : null);
  if (!pdfBase64) {
    throw new Error('PDF oficial não encontrado na resposta da SEFAZ/API.');
  }

  return URL.createObjectURL(base64ToBlob(pdfBase64, 'application/pdf'));
}

export async function registerXmlOnApi(xmlContent: string): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  try {
    const response = await fetch(`${BASE_URL}/fd/add/xml`, {
      method: 'PUT',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'text/plain',
      },
      body: xmlContent,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchNfeDataByKey(accessKey: string): Promise<DocumentData> {
  const apiKey = getApiKey();
  const headers = {
    'Api-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  let response = await fetch(`${BASE_URL}/fd/get/xml/${accessKey}`, { headers });
  if (response.status === 404) {
    const addResponse = await fetch(`${BASE_URL}/fd/add/${accessKey}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({}),
    });

    if (addResponse.ok) {
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 2000 + i * 1000));
        response = await fetch(`${BASE_URL}/fd/get/xml/${accessKey}`, { headers });
        if (response.ok) break;
      }
    }
  }

  if (!response.ok) {
    throw new Error(`Documento não encontrado na SEFAZ ou erro ${response.status}`);
  }

  const json = await response.json().catch(() => null);
  const raw = json?.data || json?.xml || (typeof json === 'string' ? json : '');
  const xml = decodeBase64(raw);
  const data = parseXmlContent(xml);
  if (!data.accessKey) data.accessKey = accessKey;
  return data;
}
