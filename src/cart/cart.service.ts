import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponsService } from '../coupons/coupons.service';
import { Product } from '../products/entities/product.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartResponse } from './interface/cart-response.interface';

const CART_EXPIRATION_DAYS = 30; // dias de expiracion 

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponsService: CouponsService,
  ) { }

  // OBTENER CARRITO EN LA BD Y SI NO ESTA CREARLO EN LA BD. Metodo para asegurar que siempre exista un carrito en la BD
  async getOrCreateCart(userId: string): Promise<Cart> {
    // Busca un carrito que coincida con el userid logueado con todas sus relaciones
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'cupon'],
    });
    // si no encuentra un carrito relacionado a ese usuario,
    if (!cart) {
      cart = this.cartRepository.create({ userId }); // crea una instancia del carrito
      cart = await this.cartRepository.save(cart); // salvalo en la BD
      cart.items = [];  // limpia items para que no de error en los demas metodos
      return cart; // retorna el carrito recien creado
    }
    // verificar si no han pasado los 30 dias, devuelve el mismo carrito ya sea vacio o con los items que tenia 
    cart = await this.handleExpiration(cart);
    return cart; // si no expiro devuelve el carrito con todos sus items
  }

  // OBTENER EL CARRITO de un usuario
  async getCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'cupon'],
    });
    // si no tiene carrito devuelve uno vacio
    if (!cart) {
      return { items: [], summary: { subtotal: 0, discount: 0, total: 0 }, lastActivity: null };
    }
    // SI tiene validar que no expiro y devolverlo con todos sus items o vacio 
    cart = await this.handleExpiration(cart);

    // retornar el carrito con todos sus items con los precios calculados en caliente
    return await this.buildCartResponse(cart);
  }

  // ADICIONAR ITEMS AL CARRITO
  async addItem(userId: string, addItemDto: AddItemDto) {
    const product = await this.productRepository.findOne({ where: { id: addItemDto.productId, isActive: true } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado o no disponible');
    }
    // Devolver carrito nuevo o existente y validar que no halla expirado
    let cart = await this.getOrCreateCart(userId);
    cart = await this.handleExpiration(cart);

    // buscar producto en el carrito
    const existingItem = cart.items.find((item) => item.productId === addItemDto.productId);

    // Si existe el items en el carrito aumenta la cantidad, sino crea un nuevo items con el precio actual que tenga el producto,
    if (existingItem) {
      existingItem.quantity += addItemDto.quantity ?? 1;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: addItemDto.productId,
        quantity: addItemDto.quantity ?? 1,
        priceAtPurchase: Number(product.price),
        appliedDiscount: 0,
      });
      await this.cartItemRepository.save(newItem); // , y guardalo en BD
    }
    // reiniciar contador de actividad 
    await this.updateLastActivity(cart.id);

    // retornar el carrito con todos los totales y subtorales calculados
    return this.getCart(userId);
  }

  // APLICAR CUPON AL CARRITO
  async applyCoupon(userId: string, code: string) {

    // validar que el cupon exista, no halla expirado y este activo
    const { coupon } = await this.couponsService.validateCoupon(code);

    // crear o retornar carrito
    let cart = await this.getOrCreateCart(userId);

    // Validar que el carrito no halla expirado
    cart = await this.handleExpiration(cart);

    // Revisar si el carrito ya tiene un cupon aplicado
    if (cart.cupon) {
      throw new BadRequestException('Ya tienes un cupón aplicado. Quítalo primero');
    }
    cart.couponId = coupon.id;                            // Id del cupon
    cart.cupon = coupon;                                  // Asignar el cupon al carrito 
    await this.cartRepository.save(cart);                 // Guardar Carrito 
    await this.couponsService.incrementUsage(coupon.id);  // Incrementa el uso del cupon 
    await this.updateLastActivity(cart.id);               // Modificar ultima actividad del carrito 
    return this.getCart(userId);                          // Retornar el carrito del usario con todos sus atributos 
  }

  // ELIMINAR CUPON DEL CARRITO
  async removeCoupon(userId: string) {
    let cart = await this.getOwnedCart(userId); // Retornar el carrito por el id o crear uno y retornarlo

    // Validar que el carrito no tenga cupon
    if (!cart.cupon) {
      throw new BadRequestException('No hay cupón aplicado en tu carrito');
    }

    // Eliminar atributos del cupon 
    cart.couponId = null;
    cart.cupon = null;
    await this.cartRepository.save(cart);   // Guardar el carrito sin cupon
    await this.updateLastActivity(cart.id); // Modificar la ultima actividad del carrito 
    return this.getCart(userId);            // retornar el carrito con sus atributos
  }

  // MODIFICAR CANTIDAD DE ITEMS
  async updateItemQuantity(userId: string, itemId: string, updateItemdto: UpdateItemDto) {
    const cart = await this.getOwnedCart(userId); // Devuelveme el carrito de ese usuario si expiro o no 
    const item = cart.items.find((i) => i.id === itemId); // devuelve items por su id
    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    item.quantity = updateItemdto.quantity; // asigna la cantidad de items que tenga 
    await this.cartItemRepository.save(item); // garda el items en la BD donde sea la cantidad igual a la que riene item.quantity
    await this.updateLastActivity(cart.id);
    return this.getCart(userId); // devuelve el carrito modificado con todos sus totales y subtotales
  }

  // ELIMINAR ITEMS DEL CARRITO
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

  // LIMPIAR CARRITO COMPLETO POR EL USUARIO 
  async clearCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'cupon']
    });

    if (!cart) {
      return { items: [], summary: { subtotal: 0, discount: 0, total: 0 }, lastActivity: null };
    }

    await this.cartItemRepository.remove(cart.items);
    cart.couponId = null;
    cart.cupon = null;
    cart.lastActivity = new Date();
    await this.cartRepository.save(cart);
    return this.getCart(userId);
  }

  // BORRAR TODOS LOS CARRITOS QUE HALLAN EXPIRADOS Y RETORNA LA CANTIDAD QUE BORRO 
  async removeAllExpiredCarts(): Promise<number> {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - CART_EXPIRATION_DAYS); // resta a la fecha actual 30 dias 

    // buscar carritos expirados en la BD y devolverlos en un arr
    const expiredCarts = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.lastActivity < :cutoff', { currentDate: currentDate })
      .getMany();

    let totalItemsRemoved = 0;
    for (const cart of expiredCarts) {
      if (cart.items && cart.items.length > 0) { // verificar si el arr existe y si tiene items
        await this.cartItemRepository.remove(cart.items); // elimina los items del carrito 
        totalItemsRemoved += cart.items.length; // total de items borrados 
      }
      await this.cartRepository.remove(cart); // borrar carrito 
    }

    return expiredCarts.length; // devuelve total de carritos eliminados
  }

  // PROGRAMAR LIMPIEZA DE LOS CARRITOS QUE LLEVEN MAS DE 30 DIAS EN EL SERVIDOR 
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleExpiredCartsJob() {
    const count = await this.removeAllExpiredCarts();
    if (count > 0) {
      console.log(`Limpieza automática: ${count} carritos expirados eliminados`);
    }
  }

  // DEVOLVER CARRITO DE UN USARIO EXPESIFICO SI EXPIRO O NO EXPIRO
  private async getOwnedCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product', 'cupon'],
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    return this.handleExpiration(cart);
  }

  // DEVULVER CARRITO VACIO SI EXPIRO O CON SUS ITEMS SI NO HA EXPIRADO
  private async handleExpiration(cartEntity: Cart): Promise<Cart> {
    const nowDate = new Date(); // fecha actual del servidor en ml

    // dif en ml desde ahora hasta la ultima actividad del carrito
    const diffDays = (nowDate.getTime() - cartEntity.lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    // si ya pasaron mas de 30 dias, limpiar carrito.
    if (diffDays >= CART_EXPIRATION_DAYS) {
      // si existe el arr de items y tiene almenos 1 items. Limpialo
      if (cartEntity.items && cartEntity.items.length > 0) {
        await this.cartItemRepository.remove(cartEntity.items);
        cartEntity.items = [];
      }

      // asigna a la ultima actividad la fecha actual.
      cartEntity.lastActivity = nowDate;
      await this.cartRepository.save(cartEntity);
    }
    // retorna carrito actualizado, ya sea vacio o con los items que tenga si no ha expirado
    return cartEntity;
  }

  // MODIFICAR ULTIMA ACTIVIAD DEL USUARIO EN EL CARRITO EN LA BD
  private async updateLastActivity(cartId: string): Promise<void> {
    await this.cartRepository.update(cartId, { lastActivity: new Date() });
  }

  // TRANSFORMAR EL CARRITO ACTTUAL CON TODOS SUS ITEMS Y PRODUCTOS EN UN JSON ESTRUCTURADO POR TOTALES Y SUBTOTALES
  private async buildCartResponse(cart: Cart): Promise<CartResponse> {
    let validDiscountPercent = 0;
    let cuponExpirado = false;
    //Si el carrito tiene cupon. cuponCode = code, sino cuponCode = null 
    const cuponCode = cart.cupon ? cart.cupon.code : null;

    // existe cupon en el carrito, validalo, si esta vigente guarda el % de descuento y coloca el porciento, sino, cupon expirado
    if (cart.cupon) {
      try {
        const validated = await this.couponsService.validateCoupon(cart.cupon.code);
        validDiscountPercent = validated.coupon.discountPercent;
      } catch {
        cuponExpirado = true;
      }
    }

    const items = (cart.items || []).map((cartItem) => { // Si cart.items es null, usar un arr bacio para que map() no de error

      const product = cartItem.product; // obtiene el producto del carrito 
      const currentPrice = product ? Number(product.price) : 0; // precio actual transformado de string a number, si es null, tomalo como 0
      const quantity = cartItem.quantity; // cantiad de items actuales en el carrito
      const subtotal = currentPrice * quantity; // subtotal = precioActual * cantidad de productos
      const unitDiscount = validDiscountPercent > 0 ? (currentPrice * validDiscountPercent) / 100 : 0; // descuento por unidad segun cupon
      const totalDiscount = unitDiscount * quantity; // descuento total
      const total = subtotal - totalDiscount; // total con descuento aplicado

      // Retornar un objeto transformado en JSON por cada items que contenga el carrito
      return {
        id: cartItem.id,
        product: product // si el producto existe devuelve la informacion necesaria
          ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            coverImage: product.coverImage,
            price: currentPrice,
            productType: product.productType,
          }
          : null, // si no existe el producto devuelve null
        quantity,
        unitPrice: currentPrice,
        priceAtPurchase: Number(cartItem.priceAtPurchase), // precio que tenia cuando se agg al carrito
        unitDiscount,
        subtotal,
        totalDiscount,
        total,
      };
    });

    // Calcular Resumen: el metodo reduce(), itera sobre todos los items y ejecuta lo que esta dentro
    const summary = items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.subtotal, // subtotal acumulado + subtotal del items
        discount: acc.discount + item.totalDiscount, // descuento acumulado + descuento toal 
        total: acc.total + item.total, // total acumulado + total del item
      }),
      { subtotal: 0, discount: 0, total: 0 }, // valor incial del acc o acumulador
    );

    const response: any = {
      id: cart.id,
      items,
      summary: { // redondear la suma de todos los subtotales, discuentos y totales a 2 numeros despues de la coma
        subtotal: Number(summary.subtotal.toFixed(2)),
        discount: Number(summary.discount.toFixed(2)),
        total: Number(summary.total.toFixed(2)),
      },
      lastActivity: cart.lastActivity,
    };

    // validar que el cuponCode tenga valores y agg la propiedad coupon en el JSON. 
    if (cuponCode) {
      response.coupon = {
        code: cuponCode,
        discountPercent: validDiscountPercent,
      };
      if (cuponExpirado) {
        response.coupon.expired = true;
      }
    }

    return response;
  }
}
