import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { StockOutUseCase } from '../../application/use-cases/stock-out.usecase';
import { CurrentUser } from '../../../merchant-auth/presentation/decorators/current-user.decorator';
import { StockOutDto } from '../dtos/stock-out.dto';
import { AdjustStockDto } from '../dtos/adjust-stock.dto';
import { StockInDto } from '../dtos/stock-in.dto';
import { GetStockMovementsUseCase } from '../../application/use-cases/get-stock-movements.usercase';
import { AdjustStockUseCase } from '../../application/use-cases/adjust-stock.usecase';
import { StockInUseCase } from '../../application/use-cases/stock-in.usecase';

@ApiTags('Stock Management')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('inventory/stock')
export class StockController {
  constructor(
    private readonly stockInUseCase: StockInUseCase,
    private readonly stockOutUseCase: StockOutUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
    private readonly getStockMovementsUseCase: GetStockMovementsUseCase,
  ) {}

  @Post('in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stock in (Add stock)',
    description:
      'Add stock to a product variant. Creates an audit trail record.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock added successfully',
    schema: {
      example: {
        success: true,
        message: 'Stock added successfully',
        data: {
          newStock: 150,
          movement: { id: 'uuid' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  async stockIn(
    @Body() dto: StockInDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.stockInUseCase.execute(dto, userId, merchantId);
    return {
      success: true,
      message: 'Stock added successfully',
      data: result,
    };
  }

  @Post('out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stock out (Remove stock)',
    description:
      'Remove stock from a product variant. Triggers low-stock alerts and KES 10k threshold tracking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock removed successfully',
    schema: {
      example: {
        success: true,
        message: 'Stock removed successfully',
        data: {
          newStock: 45,
          lowStock: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  async stockOut(
    @Body() dto: StockOutDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.stockOutUseCase.execute(dto, userId, merchantId);
    return {
      success: true,
      message: 'Stock removed successfully',
      data: result,
    };
  }

  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust stock (Manual correction)',
    description:
      'Manually adjust stock level (for corrections, damaged goods, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  async adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const result = await this.adjustStockUseCase.execute(
      dto,
      userId,
      merchantId,
    );
    return {
      success: true,
      message: 'Stock adjusted successfully',
      data: result,
    };
  }

  @Get('movements/:variantId')
  @ApiOperation({
    summary: 'Get stock movement history',
    description:
      'Get complete audit trail of stock movements for a product variant',
  })
  @ApiParam({ name: 'variantId', description: 'Product Variant UUID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    type: Number,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movements retrieved successfully',
  })
  async getStockMovements(
    @Param('variantId') variantId: string,
    @Query('limit') limit: number = 50,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    const movements = await this.getStockMovementsUseCase.execute(
      variantId,
      merchantId,
      limit,
    );
    return {
      success: true,
      data: movements,
      total: movements.length,
    };
  }
}
