import { InvalidClassException } from '@nestjs/core/errors/exceptions';
import { BadRequestException } from '@nestjs/common';

export class Email {
  private readonly _value: string;

  constructor(email: string) {
    this._value = email.toLowerCase().trim();
    this.validate();
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new BadRequestException('Please enter a valid email address');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
