import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlanService.create(createMealPlanDto)
  }

  @Get()
  findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    if (startDate && endDate) {
      return this.mealPlanService.findByDateRange(startDate, endDate)
    }
    return this.mealPlanService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlanService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ) {
    return this.mealPlanService.update(id, updateMealPlanDto)
  }

  @Post('process-past-meals')
  @HttpCode(HttpStatus.OK)
  processPastMeals() {
    return this.mealPlanService.processPastMeals();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlanService.remove(id)
  }
}

