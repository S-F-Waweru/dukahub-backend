import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class BusinessName {
    private readonly _value: string;

    constructor(value: string) {
        this._value = value.trim();
        this.validate();
    }

    private validate(): void {
        if (!this._value || this._value.length === 0) {
            throw new DomainException('Business name cannot be empty');
        }

        if (this._value.length < 2) {
            throw new DomainException('Business name must be at least 2 characters');
    }

        if (this._value.length > 255) {
            throw new DomainException('Business name too long (max 255 characters)');
        }

        // No special characters except spaces, hyphens, apostrophes
        if (!/^[a-zA-Z0-9\s\-']+$/.test(this._value)) {
            throw new DomainException(
                'Business name can only contain letters, numbers, spaces, hyphens, and apostrophes'
            );
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: BusinessName): boolean {
        return this._value === other._value;
    }
}