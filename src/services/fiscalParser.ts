import { DocumentData, NfeData, CteData, NfeEntity, NfeProduct } from '../types/fiscal';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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
    const cst = icms ? (getTag(icms, 'CST') || getTag(icms, 'CSOSN') || '000') : '000';

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
    });
  }

  const total = doc.getElementsByTagName('total')[0]?.getElementsByTagName('ICMSTot')[0];
  const infNFe = doc.getElementsByTagName('infNFe')[0];
  const ide = doc.getElementsByTagName('ide')[0];
  const transp = doc.getElementsByTagName('transp')[0];
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
    transp: { modFrete: getTag(transp, 'modFrete') },
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
    modal: getTag(ide, 'modal') || '01 - Rodoviário',
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
