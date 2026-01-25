import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: { ...createIngredientDto },
    });
  }

  async findAll(filters?: {
    search?: string;
    sans_lactose?: boolean;
    sans_gluten?: boolean;
    riche_proteines?: boolean;
    riche_fibres?: boolean;
    riche_vitamines?: boolean;
  }) {
    const where: Prisma.IngredientWhereInput = {};

    if (filters?.search) {
      where.nom = { contains: filters.search };
    }

    const nutritionalProps: Array<keyof Prisma.IngredientWhereInput> = [
      'sans_lactose',
      'sans_gluten',
      'riche_proteines',
      'riche_fibres',
      'riche_vitamines',
    ];

    nutritionalProps.forEach((prop) => {
      if ((filters as any)?.[prop] === true) {
        (where as any)[prop] = true;
      }
    });

    return this.prisma.ingredient.findMany({
      where: where,
      orderBy: {
        nom: 'asc',
      },
      include: {
        _count: {
          select: {
            recipeIngredients: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const selectFields = {
      id: true,
      titre: true,
      image_url: true,
    };
    const includeConfig = {
      recipeIngredients: {
        include: {
          recipe: {
            select: selectFields,
          },
        },
      },
    };
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: includeConfig,
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    await this.findOne(id);

    return this.prisma.ingredient.update({
      where: { id: id },
      data: updateIngredientDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.ingredient.delete({
      where: { id: id },
    });
  }
}
