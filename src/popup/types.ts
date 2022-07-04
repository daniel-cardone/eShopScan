interface SizeMap {
  [key: string]: string;
}

const SIZE_MAPPINGS: SizeMap = {
  "XXXS": "3XSMALL",
  "XXS": "2XSMALL",
  "XS": "XSMALL",
  "S": "SMALL",
  "M": "MEDIUM",
  "L": "LARGE",
  "XL": "XLARGE",
  "XXL": "2XLARGE",
  "XXXL": "3XLARGE",
  "XXXXL": "4XLARGE",
  "XXXXXL": "5XLARGE",
  "3XS": "3XSMALL",
  "2XS": "2XSMALL",
  "1XS": "XSMALL",
  "1XL": "XLARGE",
  "2XL": "2XLARGE",
  "3XL": "3XLARGE",
  "4XL": "4XLARGE",
  "5XL": "5XLARGE"
};

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
