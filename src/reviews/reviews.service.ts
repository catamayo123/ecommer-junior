import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../enum';
import { OrderItemEntity } from '../order/entities/order-item.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateReviewDTO } from './DTO/create-review.dto';
import { UpdateReviewDTO } from './DTO/update-review.dto';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async createReview(userId: string, createDTO: CreateReviewDTO) {
    const product = await this.productRepository.findOne({
      where: { id: createDTO.productId, isActive: true },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    // para comprar el usuario debe de haber comprado un porducto con la orden completada
    // los : indica a TypeORM: "esto NO es texto fijo, es una variable que se va a sustituir". placeholder
    // en resumen los : convierten a productId en una variable nombrada dentro del SQL, y el segundo argumento de
    // .where() es el diccionario de valores que la llena de forma segura.
    const purchased = await this.orderItemRepository
      .createQueryBuilder('oi')
      .leftJoin('oi.order', 'o') // union de la tabla order_item (oi), con la tabla order (0) por el id de cada una
      .where('oi.productId= :productId', { productId: createDTO.productId }) //productId de la order = productId del producto reseñado y el objeto es para hacerlo de forma segura, evitar inyecciones
      .andWhere('o.userId= :userId', { userId }) // la orden seleccionada pertenezca al usuario logueado
      .andWhere('o.status= :status', { status: OrderStatus.COMPLETED }) // que el estado de la orden sea completado
      .getOne(); // ejecuta la consulta y devuelve solo uno si existe o null en caso contrario

    if (!purchased) throw new ForbiddenException('Priermo debes de comprar un prodcuto antes de reseñarlo');

    // validar una sola reseña por usuario
    const oneReview = await this.reviewRepository.findOne({
      where: { userId, productId: createDTO.productId },
    });

    if (!oneReview) throw new ConflictException('Ya realizaste una reseña sobre este producto');

    const review = this.reviewRepository.create({ ...createDTO, userId });
    return this.reviewRepository.save(review);
  }

  // LISTAR RESEÑAS X PRODUCTO: se listan las reseñas publicas por producto con su promedio de estrellas y tola de estas
  async finAllReviewByProduct(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { productId, visible: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const count = reviews.concat.length;
    const averageRating =
      count > 0
        ? // calcular el promedio
          /*
				reviews.reduce(), recorre la variable reviews acumulando las reseseñas en la var acumulador
				review.rating, trae el puntaje de la reseña de cada una de estas
				0 es el valor inicial del acumulador 
				toFixed(2), redondea a 2 lugares despues de la coma y devuelve un string
				Number() convierte a # la respuesta de toFixed
				: 0 es el valor en caso de que count = 0
			*/
          Number(reviews.reduce((acumuador, review) => acumuador + review.rating, 0) / count).toFixed(2)
        : 0;

    return { averageRating, count, reviews };
  }

  // EDITAR RESEÑAS: solo el usuairio al que le pertenece.
  async updateReview(userId: string, id: string, updateDTO: UpdateReviewDTO) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) throw new NotFoundException('Reseña no encontrada');

    if (review.userId != userId) throw new BadRequestException('No puedes editar la sereña de otro usuario');

    Object.assign(review, updateDTO);
    return await this.reviewRepository.save(review);
  }

  // ELIMINAR RESEÑAS: Solo admin
  async deleteReview(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    review.visible = false;
    await this.reviewRepository.save(review);
    return { message: 'Reseña eliminada' };
  }
}
