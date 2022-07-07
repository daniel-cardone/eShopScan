interface QueriedElement {
  type?: string;
  textContent?: string;
  value?: string;
  classList?: string[];
  id?: string;
  alt?: string;
  extra?: {
    [key: string]: string | string[];
  }
}

interface SizeMap {
  [key: string]: string;
}

type StoreOption = 'Text' | 'Size' | 'Color' | 'Width' | 'Capacity';

type StoreType = StoreOption[];

interface StockDetail {
  click: string;
  selector: string;
  default?: boolean;
}

interface StockObject {
  [key: string]: StockDetail;
}

interface FunctionMaker {
  func: string[];
  args: Array<string[] | null>;
}

interface StoreGeneralOptionsLabel extends FunctionMaker {
  labelsToIgnore: string[];
}

interface StoreGeneralOptionsOptions extends FunctionMaker {
  query: string;
}

interface StoreGeneralOptions {
  container: string;
  label: StoreGeneralOptionsLabel;
  options: StoreGeneralOptionsOptions;
}

interface StoreExtraOptionsDetail {
  element: string;
  data: string[];
  args: string[];
}

interface StoreExtraOptions {
  [key: string]: StoreExtraOptionsDetail;
}

interface StoreOptionsObject {
  general: StoreGeneralOptions | object;
  extra: StoreExtraOptions | object;
}

interface Store {
  [key: string]: any;
  website: string;
  img: string;
  name: string;
  price: string;
  type: StoreType;
  form: StockObject | StoreOptionsObject;
}

interface StoresObject {
  [key: string]: Store;
}
