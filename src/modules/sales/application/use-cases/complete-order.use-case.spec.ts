import { BadRequestException } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import type { Order } from '../../domain/entities/order.entity';
import { CompleteOrderUseCase } from './complete-order-use-case';
import { OrderNotFoundException } from '../../domain/exceptions/sales-module.exceptions';

type EventEmitterMock = {
  emit: jest.Mock;
};

describe('CompleteOrderUseCase', () => {
  let useCase: CompleteOrderUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;
  let eventEmitter: EventEmitterMock;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    eventEmitter = {
      emit: jest.fn(),
    };

    useCase = new CompleteOrderUseCase(orderRepo, eventEmitter);
  });

  it('throws OrderNotFoundException when order does not exist', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('order-1', 'merchant-1'),
    ).rejects.toBeInstanceOf(OrderNotFoundException);

    expect(orderRepo.findById).toHaveBeenCalledWith('order-1');
  });

  it('throws OrderNotFoundException when merchantId does not match', async () => {
    const order = {
      id: 'order-1',
      merchantId: 'another-merchant',
    } as unknown as Order;

    orderRepo.findById.mockResolvedValue(order);

    await expect(
      useCase.execute('order-1', 'merchant-1'),
    ).rejects.toBeInstanceOf(OrderNotFoundException);
  });

  it('wraps domain errors from markAsCompleted in BadRequestException', async () => {
    const order = {
      id: 'order-1',
      merchantId: 'merchant-1',
      markAsCompleted: jest.fn(() => {
        throw new Error('cannot complete');
      }),
    } as unknown as Order;

    orderRepo.findById.mockResolvedValue(order);

    await expect(
      useCase.execute('order-1', 'merchant-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks order as completed, updates it and emits event on success', async () => {
    const order = {
      id: 'order-1',
      merchantId: 'merchant-1',
      customerId: 'customer-1',
      total: { value: 100 },
      markAsCompleted: jest.fn(),
    } as unknown as Order;

    orderRepo.findById.mockResolvedValue(order);
    orderRepo.update.mockResolvedValue(order);

    await useCase.execute('order-1', 'merchant-1');

    expect(order.markAsCompleted).toHaveBeenCalled();
    expect(orderRepo.update).toHaveBeenCalledWith(order);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'order.completed',
      expect.anything(),
    );
  });
});
