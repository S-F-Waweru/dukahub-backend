export class OrderNumber {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toUpperCase();
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Order number cannot be empty');
    }
    // Format: DKH-YYYYMMDD-XXXXX
    const regex = /^DKH-\d{8}-\d{5}$/;
    if (!regex.test(value)) {
      throw new Error(
        'Invalid order number format. Expected: DKH-YYYYMMDD-XXXXX',
      );
    }
  }

  static generate(): OrderNumber {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return new OrderNumber(`DKH-${year}${month}${day}-${random}`);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderNumber): boolean {
    return this._value === other._value;
  }
}
