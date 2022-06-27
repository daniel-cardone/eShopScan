interface Store {
  [key: string]: string;
  website: string;
  img: string;
  name: string;
  price: string;
  stock: string;
}

interface StoresObject {
  [key: string]: Store;
}
