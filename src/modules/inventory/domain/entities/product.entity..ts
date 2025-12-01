import { BaseEntity } from 'src/shared/domain/base.entity';

export class Product extends BaseEntity {
  private _name: string;
  private _description?: string;
  private _sku: string;
  private _price: number;
  private _cost: number;
  private _quantity: number;
  private _lowStockThreshold: number;
  private _categoryId?: string;
  private _merchantId: string;
  private _supplierId?: string;
  private _imageUrl?: string;
  private _barcode: any;
  private _unit: any;

  private constructor(props: {
    id: string;
    name: string;
    description?: string;
    sku: string;
    price: number;
    cost: number;
    quantity: number;
    lowStockThreshold: number;
    categoryId?: string;
    merchantId: string;
    supplierId?: string;
    imageUrl?: string;
    barcode?: any;
    unit: any;
  }) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._sku = props.sku;
    this._price = props.price;
    this._cost = props.cost;
    this._quantity = props.quantity;
    this._lowStockThreshold = props.lowStockThreshold;
    this._categoryId = props.categoryId;
    this._merchantId = props.merchantId;
    this._supplierId = props.supplierId;
    this._imageUrl = props.imageUrl;
    this._barcode = props.barcode;
    this._unit = props.unit;

    this.validate();
  }

  // static create(props: Omit<ProductProps, 'id'>): Product {
  //   // ✔ validate required fields
  //   // ✔ validate price > 0
  //   // ✔ validate quantity >= 0
  //   // ✔ validate sku format
  //   // ✔ validate threshold >= 0

  //   return new Product({
  //     id
  //     ...props,
  //   });
  // }

  isLowStock(): boolean {
    return this._quantity <= this._lowStockThreshold;
  }

  increaseStock(amount: number) {
    // ✔ amount > 0
    if (amount <= 0) {
      throw new Error('The amount cannot be 0');
    }
    // ✔ update safely
    this._quantity += amount;
  }

  decreaseStock(amount: number) {
    // ✔ check > 0
    if (amount <= 0) {
      throw new Error('The amount cannot be 0');
    }
    // ✔ check stock availability
    this._quantity -= amount;
  }

  updatePrice(newPrice: number) {
    // ✔ validate > 0
    if (newPrice <= 0) {
      throw new Error('Price cannot be 0');
    }
    this._price = newPrice;
  }

  calculateProfit(): number {
    // ✔ validate profit non-negative unless allowed
    return this._price - this._cost;
  }

  canFulfillOrder(quantity: number): boolean {
    // ✔ cannot request negative
    return this._quantity >= quantity;
  }

  // todo: validate the Product Object anf propertis
  validate() {
    // ✔ central validation logic
  }
}

export interface ProductProps {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: string;
  quantity: number;
  lowStockThreshold: number;
  categoryId?: string;
  merchantId: string;
  supplierId?: string;
  imageUrl: string;
  barcode: any;
  unit: any;
}
