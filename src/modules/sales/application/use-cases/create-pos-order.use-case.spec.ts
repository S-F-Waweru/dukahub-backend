/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import type { IProductVariantRepository } from '../../../inventory/domain/interface/product-variant.repository.interface';
import {
  CreatePOSOrderDto,
  CreatePOSOrderUseCase,
} from './create-pos-order.use-case';

type EventEmitterMock = {
  emit: jest.Mock;
};

describe('CreatePOSOrderUseCase', () => {
  let useCase: CreatePOSOrderUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;
  let variantRepo: jest.Mocked<IProductVariantRepository>;
  let customerRepo: jest.Mocked<ICustomerRepository>;
  let eventEmitter: EventEmitterMock;

  beforeEach(() => {
    orderRepo = {
      save: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    variantRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IProductVariantRepository>;

    customerRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ICustomerRepository>;

    eventEmitter = {
      emit: jest.fn(),
    };

    useCase = new CreatePOSOrderUseCase(
      orderRepo,
      variantRepo,
      customerRepo,
      eventEmitter,
    );
  });

  it('throws BadRequestException when variant does not exist', async () => {
    const dto: CreatePOSOrderDto = {
      merchantId: 'merchant-1',
      items: [
        {
          variantId: 'missing',
          quantity: 1,
        },
      ],
      notes: 'test',
    };

    variantRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(variantRepo.findById).toHaveBeenCalledWith('missing');
  });

  it('creates a POS order and emits event on success', async () => {
    const dto: CreatePOSOrderDto = {
      merchantId: 'merchant-1',
      customerId: 'customer-1',
      items: [
        {
          variantId: 'variant-1',
          quantity: 2,
        },
      ],
      notes: 'POS order',
    };

    variantRepo.findById.mockResolvedValue({
      id: 'variant-1',
      productId: 'product-1',
      currentStock: 10,
      sku: { value: 'SKU-1' },
      sellingPrice: { value: 100 },
    });

    customerRepo.findById.mockResolvedValue({ id: 'customer-1' });

    orderRepo.save.mockResolvedValue({
      id: 'order-1',
      orderNumber: { value: 'ORD-1' },
      total: { value: 200 },
      merchantId: dto.merchantId,
      customerId: dto.customerId,
    });

    const result = await useCase.execute(dto);

    expect(orderRepo.save).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'order.created',
      expect.anything(),
    );
    expect(result).toEqual({
      orderId: 'order-1',
      orderNumber: 'ORD-1',
      total: 200,
    });
  });
});
