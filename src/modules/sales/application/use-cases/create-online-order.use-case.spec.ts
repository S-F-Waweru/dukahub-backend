/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import type { IProductVariantRepository } from '../../../inventory/domain/interface/product-variant.repository.interface';
import {
  CreateOnlineOrderDto,
  CreateOnlineOrderUseCase,
} from './create-online-order.use-case';

type EventEmitterMock = {
  emit: jest.Mock;
};

describe('CreateOnlineOrderUseCase', () => {
  let useCase: CreateOnlineOrderUseCase;
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

    useCase = new CreateOnlineOrderUseCase(
      orderRepo,
      variantRepo,
      customerRepo,
      eventEmitter,
    );
  });

  it('throws BadRequestException when customer does not exist', async () => {
    const dto: CreateOnlineOrderDto = {
      merchantId: 'merchant-1',
      customerId: 'missing',
      items: [],
      fulfillmentInfo: {
        phone: '0700000000',
        addressLine1: 'Street 1',
        city: 'Nairobi',
        region: 'Nairobi',
      },
      notes: 'test',
    };

    customerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(customerRepo.findById).toHaveBeenCalledWith('missing');
  });

  it('creates an order and emits event on success', async () => {
    const dto: CreateOnlineOrderDto = {
      merchantId: 'merchant-1',
      customerId: 'customer-1',
      items: [
        {
          variantId: 'variant-1',
          quantity: 2,
        },
      ],
      fulfillmentInfo: {
        phone: '0700000000',
        addressLine1: 'Street 1',
        city: 'Nairobi',
        region: 'Nairobi',
      },
      notes: 'test order',
    };

    customerRepo.findById.mockResolvedValue({ id: 'customer-1' });

    variantRepo.findById.mockResolvedValue({
      id: 'variant-1',
      productId: 'product-1',
      currentStock: 10,
      sku: { value: 'SKU-1' },
      sellingPrice: { value: 100 },
    });

    orderRepo.save.mockResolvedValue({
      id: 'order-1',
      orderNumber: { value: 'ORD-1' },
      subtotal: { value: 200 },
      deliveryFee: { value: 50 },
      total: { value: 250 },
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
      subtotal: 200,
      deliveryFee: 50,
      total: 250,
    });
  });
});
