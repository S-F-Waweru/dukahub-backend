import { Money } from '../value-objects/money.vo';

export interface FulfillmentAddress {
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  landmark?: string;
}

export class FulfillmentInfo {
  private readonly _address: FulfillmentAddress;
  private readonly _deliveryInstructions?: string;

  constructor(address: FulfillmentAddress, deliveryInstructions?: string) {
    this.validate(address);
    this._address = address;
    this._deliveryInstructions = deliveryInstructions;
  }

  private validate(address: FulfillmentAddress): void {
    if (!address.phone || address.phone.trim().length === 0) {
      throw new Error('Delivery phone number is required');
    }
    if (!address.addressLine1 || address.addressLine1.trim().length === 0) {
      throw new Error('Address line 1 is required');
    }
    if (!address.city || address.city.trim().length === 0) {
      throw new Error('City is required');
    }
  }

  static fromJSON(json: any): FulfillmentInfo {
    return new FulfillmentInfo(
      {
        phone: json.phone,
        addressLine1: json.addressLine1,
        addressLine2: json.addressLine2,
        city: json.city,
        region: json.region,
        landmark: json.landmark,
      },
      json.deliveryInstructions,
    );
  }

  toJSON(): any {
    return {
      phone: this._address.phone,
      addressLine1: this._address.addressLine1,
      addressLine2: this._address.addressLine2,
      city: this._address.city,
      region: this._address.region,
      landmark: this._address.landmark,
      deliveryInstructions: this._deliveryInstructions,
    };
  }

  // Business Logic - Calculate delivery fee based on location
  calculateDeliveryFee(): Money {
    const city = this._address.city.toLowerCase();

    // Nairobi - flat rate
    if (city.includes('nairobi')) {
      return new Money(200); // KES 200
    }

    // Major cities
    const majorCities = ['mombasa', 'kisumu', 'nakuru', 'eldoret'];
    if (majorCities.some((c) => city.includes(c))) {
      return new Money(500); // KES 500
    }

    // Other areas
    return new Money(800); // KES 800
  }

  get address(): FulfillmentAddress {
    return { ...this._address };
  }

  get deliveryInstructions(): string | undefined {
    return this._deliveryInstructions;
  }
}
