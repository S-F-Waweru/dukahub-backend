import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class KraPin {
    private readonly _value: string;

    constructor(value: string) {
        this._value = value.toUpperCase().trim();
        this.validate();
    }

    private validate(): void {
        if (!this._value) {
            // KRA PIN is optional
            return;
        }

        // KRA PIN format: A000000000X (Letter + 9 digits + Letter)
        const kraRegex = /^[A-Z]\d{9}[A-Z]$/;

        if (!kraRegex.test(this._value)) {
            throw new DomainException(
                'Invalid KRA PIN format. Expected format: A000000000X'
            );
        }
    }

    get value(): string {
        return this._value;
    }

    equals(other: KraPin): boolean {
        return this._value === other._value;
    }
}