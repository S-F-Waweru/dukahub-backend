// src/modules/sales/application/services/order-number-generator.service.ts
import { Injectable } from '@nestjs/common';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';

@Injectable()
export class OrderNumberGeneratorService {
  generate(): OrderNumber {
    return OrderNumber.generate();
  }

  // For testing: generate with specific date
  generateWithDate(date: Date): OrderNumber {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return new OrderNumber(`DKH-${year}${month}${day}-${random}`);
  }
}
