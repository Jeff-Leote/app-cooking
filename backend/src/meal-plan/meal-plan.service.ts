import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Injectable()
export class MealPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto) {
    const args = {
      data: {
        date: new Date(createMealPlanDto.date),
        moment: createMealPlanDto.moment,
        recipe_id: createMealPlanDto.recipe_id,
        note: createMealPlanDto.note,
      },
      include: {
        recipe: true,
      },
    };
    return this.prisma.mealPlan.create(args);
  }

  async findAll() {
    const args = {
      include: {
        recipe: true,
      },
      orderBy: {
        date: 'desc',
      },
    } as const;
    return this.prisma.mealPlan.findMany(args);
  }

  async findByDateRange(startDate: string, endDate: string) {
    const args = {
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        recipe: true,
      },
      orderBy: {
        date: 'asc',
      },
    } as const;
    return this.prisma.mealPlan.findMany(args);
  }

  async findOne(id: number) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        recipe: true,
      },
    });

    if (!mealPlan) {
      throw new NotFoundException(`MealPlan with ID ${id} not found`);
    }

    return mealPlan;
  }

  async update(id: number, updateMealPlanDto: UpdateMealPlanDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (updateMealPlanDto.date) {
      updateData.date = new Date(updateMealPlanDto.date);
    }
    if (updateMealPlanDto.moment) {
      updateData.moment = updateMealPlanDto.moment;
    }
    if (updateMealPlanDto.recipe_id !== undefined) {
      updateData.recipe_id = updateMealPlanDto.recipe_id;
    }
    if (updateMealPlanDto.note !== undefined) {
      updateData.note = updateMealPlanDto.note;
    }

    const args = {
      where: { id },
      data: updateData,
      include: {
        recipe: true,
      },
    };
    return this.prisma.mealPlan.update(args);
  }

  async remove(id: number) {
    await this.findOne(id);

    const args = {
      where: { id },
    };
    return this.prisma.mealPlan.delete(args);
  }
}

