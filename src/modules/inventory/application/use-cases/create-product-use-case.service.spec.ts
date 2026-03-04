/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { ConflictException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/interface/product-repository.interface';
import type { IProductVariantRepository } from '../../domain/interface/product-variant.repository.interface';
import {
  CreateProductDto,
  CreateProductUseCase,
} from './create-product-use-case.service';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let productVariantRepo: jest.Mocked<IProductVariantRepository>;

  beforeEach(() => {
    productRepo = {
      save: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    productVariantRepo = {
      findBySKU: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IProductVariantRepository>;

    useCase = new CreateProductUseCase(productRepo, productVariantRepo);
  });

  it('throws ConflictException when a variant SKU already exists', async () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      description: 'desc',
      categoryId: 'cat-1',
      basePrice: 100,
      reorderPoint: 5,
      hasVariants: true,
      variants: [
        {
          sku: 'SKU-1',
          attributes: {},
          costPrice: 50,
          sellingPrice: 100,
          initialStock: 10,
        },
      ],
    };

    productVariantRepo.findBySKU.mockResolvedValue({ id: 'existing-variant' });

    await expect(
      useCase.execute(dto, 'merchant-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(productVariantRepo.findBySKU).toHaveBeenCalledWith(
      'SKU-1',
      'merchant-1',
    );
  });

  it('creates product and variants on success', async () => {
    const dto: CreateProductDto = {
      name: 'Test Product',
      description: 'desc',
      categoryId: 'cat-1',
      basePrice: 100,
      reorderPoint: 5,
      hasVariants: true,
      variants: [
        {
          sku: 'SKU-1',
          attributes: { size: 'M' },
          costPrice: 50,
          sellingPrice: 100,
          initialStock: 10,
          reorderPoint: 3,
        },
      ],
    };

    productVariantRepo.findBySKU.mockResolvedValue(null);

    productRepo.save.mockResolvedValue({
      id: 'product-1',
    });

    productVariantRepo.save.mockResolvedValue({
      id: 'variant-1',
    });

    const result = await useCase.execute(dto, 'merchant-1');

    expect(productRepo.save).toHaveBeenCalled();
    expect(productVariantRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ productId: 'product-1' });
  });
});

