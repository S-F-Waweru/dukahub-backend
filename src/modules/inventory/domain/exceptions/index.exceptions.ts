import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InsufficientStockException extends DomainException {
  constructor(sku: string, requested: number, available: number) {
    super(
      `Insufficient stock for SKU ${sku}. Requested: ${requested}, Available: ${available}`
    );
    this.name = 'InsufficientStockException';
  }
}

export class InvalidPriceException extends DomainException {
  constructor(reason: string) {
    super(`Invalid price: ${reason}`);
    this.name = 'InvalidPriceException';
  }
}

export class InvalidSKUException extends DomainException {
  constructor(sku: string, reason: string) {
    super(`Invalid SKU "${sku}": ${reason}`);
    this.name = 'InvalidSKUException';
  }
}

export class ProductNotFoundException extends DomainException {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`);
    this.name = 'ProductNotFoundException';
  }
}

export class VariantNotFoundException extends DomainException {
  constructor(variantId: string) {
    super(`Product variant with ID ${variantId} not found`);
    this.name = 'VariantNotFoundException';
  }
}

export class DuplicateSKUException extends DomainException {
  constructor(sku: string) {
    super(`SKU "${sku}" already exists`);
    this.name = 'DuplicateSKUException';
  }
}
