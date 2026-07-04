import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const CART_EXPIRATION_DAYS = 30;

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // OBTENER CARRITO Y SI NO ESTA CREARLO
  async getOrCreateCart(userId: string): Promise<Cart> {
    // Busca un carrito que coincida con el userid logueado con todas sus relaciones
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
    // si no encuentra un carrito relacionado a ese usuario, , 
    if (!cart) {
      cart = this.cartRepository.create({ userId }); // crea una instancia del carrito
      cart = await this.cartRepository.save(cart); // salvalo
      cart.items = [];  // limpia items para que no de error en los demas metodos
      return cart; // retorna el carrito recien creado
    }
    // verificar si no han pasado los 30 
    cart = await this.handleExpiration(cart);
    return cart; // si no expiro devuelve el carrito 
  }

  async getCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      return { items: [], summary: { subtotal: 0, discount: 0, total: 0 }, lastActivity: null };
    }

    cart = await this.handleExpiration(cart);
    return this.buildCartResponse(cart);
  }

  async addItem(userId: string, dto: AddItemDto) {
    const product = await this.productRepository.findOne({ where: { id: dto.productId, isActive: true } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado o no disponible');
    }

    let cart = await this.getOrCreateCart(userId);
    cart = await this.handleExpiration(cart);

    const existingItem = cart.items.find((item) => item.productId === dto.productId);

    if (existingItem) {
      existingItem.quantity += dto.quantity ?? 1;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity ?? 1,
        priceAtPurchase: Number(product.price),
        appliedDiscount: 0,
      });
      await this.cartItemRepository.save(newItem);
    }

    await this.updateLastActivity(cart.id);
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateItemDto) {
    const cart = await this.getOwnedCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    await this.updateLastActivity(cart.id);
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOwnedCart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    await this.cartItemRepository.remove(item);
    await this.updateLastActivity(cart.id);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) {
      return { items: [], summary: { subtotal: 0, discount: 0, total: 0 }, lastActivity: null };
    }

    await this.cartItemRepository.remove(cart.items);
    cart.lastActivity = new Date();
    await this.cartRepository.save(cart);
    return this.getCart(userId);
  }

  async removeAllExpiredCarts(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CART_EXPIRATION_DAYS);

    const expiredCarts = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.lastActivity < :cutoff', { cutoff })
      .getMany();

    let totalItemsRemoved = 0;
    for (const cart of expiredCarts) {
      if (cart.items && cart.items.length > 0) {
        await this.cartItemRepository.remove(cart.items);
        totalItemsRemoved += cart.items.length;
      }
      await this.cartRepository.remove(cart);
    }

    return expiredCarts.length;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleExpiredCartsJob() {
    const count = await this.removeAllExpiredCarts();
    if (count > 0) {
      console.log(`Limpieza automática: ${count} carritos expirados eliminados`);
    }
  }

  private async getOwnedCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    return this.handleExpiration(cart);
  }

  // 
  private async handleExpiration(cartEntity: Cart): Promise<Cart> {
    const now = new Date();
    const diffDays = (now.getTime() - cartEntity.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    //
    if (diffDays >= CART_EXPIRATION_DAYS) { 
      if (cartEntity.items && cartEntity.items.length > 0) {
        await this.cartItemRepository.remove(cartEntity.items);
        cartEntity.items = [];
      }
      cartEntity.lastActivity = now;
      await this.cartRepository.save(cartEntity);
    }

    return cartEntity;
  }

  private async updateLastActivity(cartId: string): Promise<void> {
    await this.cartRepository.update(cartId, { lastActivity: new Date() });
  }

  private buildCartResponse(cart: Cart) {
    const items = (cart.items || []).map((item) => {
      const product = item.product;
      const unitPrice = product ? Number(product.price) : 0;
      const quantity = item.quantity;
      const subtotal = unitPrice * quantity;
      const totalDiscount = Number(item.appliedDiscount) * quantity;
      const total = subtotal - totalDiscount;

      return {
        id: item.id,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
              coverImage: product.coverImage,
              price: unitPrice,
              productType: product.productType,
            }
          : null,
        quantity,
        unitPrice,
        priceAtPurchase: Number(item.priceAtPurchase),
        unitDiscount: Number(item.appliedDiscount),
        subtotal,
        totalDiscount,
        total,
      };
    });

    const summary = items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.subtotal,
        discount: acc.discount + item.totalDiscount,
        total: acc.total + item.total,
      }),
      { subtotal: 0, discount: 0, total: 0 },
    );

    return {
      id: cart.id,
      items,
      summary: {
        subtotal: Number(summary.subtotal.toFixed(2)),
        discount: Number(summary.discount.toFixed(2)),
        total: Number(summary.total.toFixed(2)),
      },
      lastActivity: cart.lastActivity,
    };
  }
}
