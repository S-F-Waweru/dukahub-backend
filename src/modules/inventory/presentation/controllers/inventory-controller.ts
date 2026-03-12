import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ProductResponseDto } from '../dtos/product-response.dto';
import { CurrentUser } from 'src/modules/merchant-auth/presentation/decorators/current-user.decorator';
import { CreateProductDto } from '../dtos/create-product.dto';
import { CreateProductUseCase } from '../../application/use-cases/create-product-use-case.service';
import { GetLowStockProductUseCase } from '../../application/use-cases/get-low-stock-product.usecase';
import { ListProductUseCase } from '../../application/use-cases/list-product.usecase';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.usecase';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.usecase';
import { GetProductUseCase } from '../../application/use-cases/get-product.usecase';
import { JwtAuthGuard } from '../../../merchant-auth/presentation/guards/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/products')
class InventoryController {
  private readonly createProductUseCase: CreateProductUseCase;

  constructor(
    createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductUseCase,
    private readonly getLowStockUseCase: GetLowStockProductUseCase,
  ) {
    this.createProductUseCase = createProductUseCase;
  }
  logger = new Logger(InventoryController.name)

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new product',
    description:
      'Create a new product with optional variants. Supports simple products and products with multiple variants (size, color, etc.)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    this.logger.log(`Creating Merchant`, merchantId);
    this.logger.log(merchantId);
    const result = await this.createProductUseCase.execute(dto, merchantId);
    return {
      success: true,
      message: 'Product created successfully',
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List all products',
    description:
      'Get all products for the current merchant with optional category filtering',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  async listProducts(
    @CurrentUser('merchantId') merchantId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const products = await this.listProductsUseCase.execute(
      merchantId,
      categoryId,
    );
    return {
      success: true,
      data: products,
      total: products.length,
    };
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Get low stock products',
    description:
      'Get all products that are at or below their reorder point threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved',
  })
  async getLowStockProducts(@CurrentUser('merchantId') merchantId: string) {
    const products = await this.getLowStockUseCase.execute(merchantId);
    return {
      success: true,
      data: products,
      total: products.length,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description:
      'Get detailed information about a specific product including all variants',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const product = await this.getProductUseCase.execute(id, merchantId);
    return {
      success: true,
      data: product,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Update product details (name, description, pricing, etc.)',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.updateProductUseCase.execute(id, dto, merchantId);
    return {
      success: true,
      message: 'Product updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product',
    description:
      'Soft delete a product. Product can only be deleted if all variants have zero stock.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete product with stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    await this.deleteProductUseCase.execute(id, merchantId);
  }
}

export default InventoryController;
