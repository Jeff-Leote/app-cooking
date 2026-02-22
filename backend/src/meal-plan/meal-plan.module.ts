import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { PrismaService } from '../prisma/prisma.service';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [StockModule],
  controllers: [MealPlanController],
  providers: [MealPlanService, PrismaService],
  exports: [MealPlanService],
})
export class MealPlanModule {}

