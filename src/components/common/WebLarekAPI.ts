import { IOrder, ISuccess, ICardProduct, IProductList } from '../../types/index';
import { Api } from "../base/api";

export interface IWebLarekAPI {
  getProductsList: () => Promise<ICardProduct[]>;
  getProduct: (id: string) => Promise<ICardProduct>;
  orderProduct: (order: IOrder) => Promise<ISuccess>;
}


export class WebLarekAPI extends Api implements IWebLarekAPI {
  readonly cdn: string;

  constructor(baseUrl: string, cdnUrl: string, options: RequestInit = {}) {
    super(baseUrl, options);
    this.cdn = cdnUrl;
  }

  getProduct(id: string): Promise<ICardProduct> {
    return this.get(`/product/${id}`).then((product: ICardProduct) => {
      return { ...product, image: this.cdn + product.image };
    });
  }

  getProductsList(): Promise<ICardProduct[]> {
    return this.get('/product/').then((resp: IProductList) => {
      return resp.items.map((product) => ({
        ...product,
        image: this.cdn + product.image,
      }));
    });
  }

  orderProduct(order: IOrder): Promise<ISuccess> {
    return this.post('/order', order) as Promise<ISuccess>;
  }
}