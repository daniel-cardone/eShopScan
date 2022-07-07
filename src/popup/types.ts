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

interface SizeBoxesDetail {
  element: string;
  data: string[];
  args: string[];
}

interface SizeBoxesObject {
  [key: string]: SizeBoxesDetail;
}

interface Store {
  [key: string]: any;
  website: string;
  img: string;
  name: string;
  price: string;
  type: StoreType;
  form: StockObject | SizeBoxesObject;
}

interface StoresObject {
  [key: string]: Store;
}
