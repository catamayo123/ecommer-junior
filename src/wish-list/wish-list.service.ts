import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateWhishListDTO } from './DTO/create-wishList.dto';
import { WhishListEntity } from './Entity/wish-list.entity';

@Injectable()
export class WishListService {
  constructor(
    @InjectRepository(WhishListEntity)
    private readonly wishListRepository: Repository<WhishListEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // CREAR LISTA DE FAVORITOS
  async createWishList(userId: string, createDTO: CreateWhishListDTO) {
    const product = await this.productRepository.findOne({
      where: { id: createDTO.productId, isActive: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    // buscar el favorito incluyendo los eliminados (soft) para poder restaurarlo
    const exists = await this.wishListRepository.findOne({
      where: { userId, productId: createDTO.productId },
      withDeleted: true,
    });

    // si ya está activo en la lista, no se puede agregar de nuevo
    if (exists && !exists.deletedAt) {
      throw new ConflictException('Ya tienes este producto en tu lista de deseos');
    }

    // si existía pero fue eliminado por el usuario, se restaura en vez de crear un duplicado
    if (exists && exists.deletedAt) {
      await this.wishListRepository.restore(exists.id);
      return this.wishListRepository.findOne({ where: { id: exists.id } });
    }

    const wish = this.wishListRepository.create({ ...createDTO, userId });
    return this.wishListRepository.save(wish);
  }

  // VER LA LISTA DE FAVORITOS
  async findALLWishList(userId: string) {
    const wishList = await this.wishListRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    // filtrar los favoritos cuyo producto fue soft-deleteado (product: null) para que el cliente no los vea
    return wishList.filter((item) => item.product);
  }

  // ELIMINAR PRODUCTO DE LA LISTA DE FAVORITOS
  async deleteWishList(id: string, userId: string) {
    const wish = await this.wishListRepository.findOne({
      where: { id, userId },
    });
    if (!wish) throw new NotFoundException('producto no encontrado en su lista de favoritos');

    await this.wishListRepository.softRemove(wish);
    return { message: 'Favorito eliminado' };
  }
}
