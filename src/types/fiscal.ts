export type NfeAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
};

export type NfeEntity = {
  name: string;
  taxId: string;
  ie?: string;
  address: NfeAddress;
};

export type NfeProduct = {
  code: string;
  description: string;
  ncm: string;
  cst: string;
  cfop: string;
  unit: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  bcIcms?: number;
  valIcms?: number;
  valIpi?: number;
  aliqIcms?: number;
  aliqIpi?: number;
};

export type NfeTotals = {
  bcIcms: number;
  valIcms: number;
  bcIcmsSt: number;
  valIcmsSt: number;
  valPis: number;
  valCofins: number;
  valProducts: number;
  valFreight: number;
  valInsurance: number;
  valDiscount: number;
  valOther: number;
  valIpi: number;
  valTotal: number;
};

export type NfeDuplicata = {
  number: string;
  dueDate: string;
  value: number;
};

export type NfeTransport = {
  modFrete: string;
  name?: string;
  taxId?: string;
  ie?: string;
  address?: string;
  city?: string;
  state?: string;
  vehiclePlate?: string;
  vehicleState?: string;
  rntrc?: string;
  volumeQuantity?: number;
  volumeSpecies?: string;
  volumeBrand?: string;
  volumeNumber?: string;
  netWeight?: number;
  grossWeight?: number;
};

export type NfeData = {
  docType: 'nfe';
  accessKey: string;
  number: string;
  series: string;
  naturezaOperacao: string;
  protocol: string;
  issueDate: string;
  emitente: NfeEntity;
  destinatario: NfeEntity;
  products: NfeProduct[];
  totals: NfeTotals;
  duplicatas: NfeDuplicata[];
  transport: NfeTransport;
  infoAdic: string;
};

export type CteData = {
  docType: 'cte';
  accessKey: string;
  number: string;
  series: string;
  model: string;
  naturezaOperacao: string;
  protocol: string;
  issueDate: string;
  emitente: NfeEntity;
  remetente: NfeEntity;
  destinatario: NfeEntity;
  recebedor?: NfeEntity;
  expedidor?: NfeEntity;
  tomador: NfeEntity;
  valorTotalPrestacao: number;
  valorReceber: number;
  icms: { cst: string; vBC: number; pICMS: number; vICMS: number };
  produtoPredominante: string;
  valorCarga: number;
  pesoBruto: number;
  pesoCubado: number;
  volumes: number;
  medidas: string;
  modal: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  infoAdic: string;
};

export type DocumentData = NfeData | CteData;
