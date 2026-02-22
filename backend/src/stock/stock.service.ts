import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async create(createStockDto: CreateStockDto) {
    // Vérifier que l'ingrédient existe
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: createStockDto.ingredient_id },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${createStockDto.ingredient_id} not found`);
    }

    // Vérifier si le stock existe déjà pour cet ingrédient
    const existingStock = await this.prisma.stock.findUnique({
      where: { ingredient_id: createStockDto.ingredient_id },
    });

    if (existingStock) {
      // Mettre à jour le stock existant
      return this.update(existingStock.id, createStockDto);
    }

    // Créer un nouveau stock
    const data: any = {
      ingredient_id: createStockDto.ingredient_id,
      quantite: createStockDto.quantite || null,
    };

    if (createStockDto.date_peremption) {
      data.date_peremption = new Date(createStockDto.date_peremption);
    }

    return this.prisma.stock.create({ data });
  }

  async findAll() {
    return this.prisma.stock.findMany({
      include: {
        ingredient: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const stock = await this.prisma.stock.findUnique({
      where: { id },
      include: {
        ingredient: true,
      },
    });

    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    return stock;
  }

  async findByIngredient(ingredientId: number) {
    return this.prisma.stock.findUnique({
      where: { ingredient_id: ingredientId },
      include: {
        ingredient: true,
      },
    });
  }

  async update(id: number, updateStockDto: UpdateStockDto) {
    await this.findOne(id);

    const data: any = {};

    if (updateStockDto.quantite !== undefined) {
      data.quantite = updateStockDto.quantite;
    }

    if (updateStockDto.date_peremption !== undefined) {
      data.date_peremption = updateStockDto.date_peremption ? new Date(updateStockDto.date_peremption) : null;
    }

    return this.prisma.stock.update({
      where: { id },
      data,
      include: {
        ingredient: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.stock.delete({
      where: { id },
    });
  }

  async removeByIngredient(ingredientId: number) {
    return this.prisma.stock.deleteMany({
      where: { ingredient_id: ingredientId },
    });
  }

  async decreaseQuantity(ingredientId: number, quantity: string) {
    const stock = await this.findByIngredient(ingredientId);
    
    if (!stock) {
      return null;
    }

    // Pour simplifier, on retire juste l'ingrédient du stock
    // Dans une version plus avancée, on pourrait gérer les quantités numériques
    return this.remove(stock.id);
  }
}
