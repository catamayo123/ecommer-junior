import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  // CREAR CUPON
  async createCoupon(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const code = createCouponDto.code.toUpperCase();

    // existe el cupon con ese codigo ?
    const existingCoupon = await this.couponRepository.findOne({ where: { code } });
    if (existingCoupon) {
      throw new ConflictException('Ya existe un cupón con ese código');
    }

    // existe limite de uso y es < 1
    if (createCouponDto.usageLimit !== undefined && createCouponDto.usageLimit < 1) {
      throw new BadRequestException('El límite de uso debe ser al menos 1');
    }

    // Si pasa todas las validaciones crea la instancia del cupon y guardalo en BD
    const coupon = this.couponRepository.create({ ...createCouponDto, code });
    return this.couponRepository.save(coupon);
  }

  // BUSCAR TODOS LOS CUPONES y mostrar los mas nuevos primeros 
  async findAllCoupons(): Promise<Coupon[]> {
    return this.couponRepository.find({ order: { createdAt: 'DESC' } });
  }

  // BUSCAR CUPON POR ID
  async findCouponById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    return coupon;
  }

  // BUSCAR CUPON POR CODIGO
  async findCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }
    return coupon;
  }

  // MODIFICAR CUPON
  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findCouponById(id);
    // existe cupon que pasaron por parametro y no hay mas ninguno en la BD con ese id ?
    if (updateCouponDto.code) {
      const code = updateCouponDto.code.toUpperCase();
      const existingCoupon = await this.couponRepository.findOne({ where: { code } });
      if (existingCoupon && existingCoupon.id !== id) {
        throw new ConflictException('Ya existe otro cupón con ese código');
      }
      // modifica
      coupon.code = code;
    }

    if (updateCouponDto.usageLimit !== undefined && updateCouponDto.usageLimit < 1) {
      throw new BadRequestException('El límite de uso debe ser al menos 1');
    }
    // copia el cupon del parametro en el cupon que buscaste en BD y guardalo en el cupon de la BD
    Object.assign(coupon, updateCouponDto);
    return this.couponRepository.save(coupon);
  }

  // ELIMINAR CUPON
  async removeCoupon(id: string): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Cupón no encontrado');
    }
  }

  // VALIDAR CUPON para poderlo integrar al carrEntity)
  async validateCoupon(code: string): Promise<{ coupon: Coupon; discountPercent: number }> {
    const coupon = await this.findCouponByCode(code); // busca cupon por codigo 

    // si no esta activo excepcion 
    if (!coupon.isActive) {
      throw new BadRequestException('Este cupón está desactivado');
    }

    // si xiste y ya expirado, o si no existe exeption
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Este cupón ha expirado');
    }

    // Si tiene limite de uso y ese limite es mayor que la cantidad de veces a usar exception
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Este cupón ha alcanzado su límite de uso');
    }

    // si paso todas la validaciones retorname el cupon y su descuento
    return { coupon, discountPercent: coupon.discountPercent };
  }

  // INCREMENTAR USO DEL CUPON (cuando se aplica al carrito)
  async incrementUsage(id: string): Promise<void> {
    await this.couponRepository.increment({ id }, 'usedCount', 1);
  }
}
