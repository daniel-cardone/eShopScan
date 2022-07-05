interface SizeMap {
  [key: string]: string;
}

type StoreType = 'stock-text' | 'size-boxes';

interface StockDetail {
  click: string;
  selector: string;
  default?: boolean;
}

interface StockObject {
  [key: string]: StockDetail;
}

interface SizeBoxesDetail {
  selector: string;
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
  check: StockObject | SizeBoxesObject;
}

interface StoresObject {
  [key: string]: Store;
}
