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

    // validar que el  se add una sola vez a la lista de deseos
    const exists = await this.wishListRepository.findOne({
      where: { userId, productId: createDTO.productId },
    });

    if (!exists) throw new ConflictException('Ya realizaste una reseña sobre este producto');

    const review = this.wishListRepository.create({ ...createDTO, userId });
    return this.wishListRepository.save(review);
  }

  // VER LA LISTA DE FAVORITOS
  async findALLWishList(userId: string) {
    return await this.wishListRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
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
