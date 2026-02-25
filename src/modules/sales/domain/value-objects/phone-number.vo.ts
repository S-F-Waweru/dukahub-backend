export class PhoneNumber {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = this.normalize(value);
  }

  private validate(value: string): void {
    // Kenyan format: 07XXXXXXXX or 01XXXXXXXX or +2547XXXXXXXX
    const regex = /^(\+254|0)[17]\d{8}$/;
    const normalized = value.replace(/\s+/g, '');
    if (!regex.test(normalized)) {
      throw new Error('Invalid Kenyan phone number format');
    }
  }

  private normalize(value: string): string {
    let cleaned = value.replace(/\s+/g, '');
    // Convert to international format
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    }
    return cleaned;
  }

  get value(): string {
    return this._value;
  }

  equals(other: PhoneNumber): boolean {
    return this._value === other._value;
  }
}
