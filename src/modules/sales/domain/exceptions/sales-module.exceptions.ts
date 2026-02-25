import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

export class OrderNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Order with identifier '${identifier}' not found`);
  }
}

export class CustomerNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Customer with identifier '${identifier}' not found`);
  }
}

export class InvalidOrderStatusException extends BadRequestException {
  constructor(currentStatus: string, attemptedAction: string) {
    super(`Cannot ${attemptedAction} order with status '${currentStatus}'`);
  }
}
