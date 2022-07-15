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

interface IgnoredLabel {
  type: 'label-has-text' | 'parent-has-text' | 'label-equals-text' | 'parent-equals-text' | 'label-matches-selector' | 'parent-matches-selector' | 'label-has-selector' | 'parent-has-selector';
  rule: string;
}

interface StoreGeneralOptionsLabel extends FunctionMaker {
  labelsToIgnore: IgnoredLabel[];
}

interface StoreGeneralOptionsOptions extends FunctionMaker {
  query: string;
  fallback?: StoreGeneralOptionsOptions;
}

interface StoreGeneralOptions {
  container: string;
  parents: number;
  label: StoreGeneralOptionsLabel;
  options: StoreGeneralOptionsOptions;
}

interface StoreExtraOptionsDetail {
  query: string;
  func: string[];
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
  form: StockObject | StoreOptionsObject;
}

interface StoresObject {
  [key: string]: Store;
}

interface TrackRequest {
  productURL: string;
  userID: string;
  formData: {
    [key: string]: string;
  };
}
