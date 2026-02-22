import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { ShoppingItemsModule } from './shopping-items/shopping-items.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { PrismaService } from './prisma/prisma.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    RecipesModule,
    MealPlanModule,
    ShoppingItemsModule,
    IngredientsModule,
    DashboardModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
