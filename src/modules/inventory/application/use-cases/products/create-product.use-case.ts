export class CreateProductUseCase {
  constructor(
    private readonly productRepo: any,
    private readonly categoryRepo: any,
    private readonly supplierRepo: any,
    private readonly stockMovementRepo: any,
  ) {}

  async execute(dto: any): Promise<any> {}
}
