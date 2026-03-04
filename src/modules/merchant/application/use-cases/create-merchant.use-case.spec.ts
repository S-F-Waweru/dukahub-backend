/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { ConflictException } from '@nestjs/common';
import type { IMerchantRepository } from '../../domain/interfaces/merchant.repository.interface';
import {
  CreateMerchantDto,
  CreateMerchantUseCase,
} from './create-merchant.use-case';

describe('CreateMerchantUseCase', () => {
  let useCase: CreateMerchantUseCase;
  let merchantRepo: jest.Mocked<IMerchantRepository>;

  beforeEach(() => {
    merchantRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IMerchantRepository>;

    useCase = new CreateMerchantUseCase(merchantRepo);
  });

  it('throws ConflictException when merchant with email already exists', async () => {
    const dto: CreateMerchantDto = {
      businessName: 'Biz',
      type: 0 as any,
      phoneNumber: '0700',
      email: 'existing@example.com',
    };

    merchantRepo.findByEmail.mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(merchantRepo.findByEmail).toHaveBeenCalledWith(dto.email);
  });

  it('creates merchant and returns merchantId on success', async () => {
    const dto: CreateMerchantDto = {
      businessName: 'Biz',
      type: 0 as any,
      phoneNumber: '0700',
      email: 'new@example.com',
      physicalAddress: 'Address',
      kraPin: 'KRA123',
    };

    merchantRepo.findByEmail.mockResolvedValue(null);

    merchantRepo.save.mockResolvedValue({
      id: 'merchant-1',
    });

    const result = await useCase.execute(dto);

    expect(merchantRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ merchantId: 'merchant-1' });
  });
});

