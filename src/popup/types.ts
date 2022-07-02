interface StockDetail {
  click: string;
  selector: string;
  default?: boolean;
}

interface StockObject {
  [key: string]: StockDetail;
}

interface Store {
  [key: string]: any;
  website: string;
  img: string;
  name: string;
  price: string;
  stock: StockObject;
}

interface StoresObject {
  [key: string]: Store;
}
