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

type StoreType = 'stock-text' | 'size-boxes' | 'size-color-boxes';

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
  data: string;
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
