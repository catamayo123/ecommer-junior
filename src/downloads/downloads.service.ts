import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../order/entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { IBaseICourseAndIBook, ICourses, IeBooks } from './interfaces/downloads.interface';

@Injectable()
export class DownloadsService {
	constructor(
		@InjectRepository(Order)
		private readonly orderRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private readonly OrderItemRepository: Repository<OrderItem>,
		@InjectRepository(Payment)
		private readonly paymentRepository: Repository<Payment>,
		private readonly jwtService: JwtService
	) { }

	// LISTAR TODOS LOS PRODUCTOS COMPRADOS POR EL USUARIO 
	/*
		Busca todas las ordenes de ese usuario 
		Recorre todas esas ordenes y los items de cada orden opteniendo solo los productos que si esten 
		Crea la base de la descargas con todas sus propiedades para poder add a los cursos y eBooks que extienden de ella
		Crea course si son videos y sino crea eBooks
		Retorna los 2 [], curso y eBooks
	*/

	async finAllDownloads(userId: string) {
		const orders = await this.orderRepository.find({
			where: { id: userId },
			relations: ['items', 'items.product', 'items.product.category']
		})

		const course: ICourses[] = []
		const eBooks: IeBooks[] = []

		// recorrer cada orden del usuario, y dentro de esa orden, recorre cada items que tenga, 
		// si no existe un producto sigue, no lo incluyas
		for (const order of orders) {
			for (const item of order.items) {
				const product = item.product

				if (!product) continue

				// crea un objeto que implementa la interfaz IBaseICourseAndIBook para poder agg al curso o a los eBooks
				const baseDownload: IBaseICourseAndIBook = {
					orderItemId: item.id,
					productId: product.id,
					name: product.name,
					slug: product.slug,
					description: product.description,
					coverImage: product.coverImage,
					fileName: product.fileName,
					category: product.category?.name || 'General',
					categorySlug: product.category?.slug || 'gneral',
					purchasedAt: order.completedAt
				}

				if (product.productType === 'course') {
					course.push({
						...baseDownload,
						canAccess: true,
						urlVideo: `/uploads/archivos/${product.fileName}`
					});
				} else {
					// la fecha de hoy es mayor que el token de expiracion: isExpired = false, sino isExpired = true
					const isExpired = item.downloadTokenExpiresAt
						? new Date() > item.downloadTokenExpiresAt
						: true;

					eBooks.push({
						...baseDownload,
						downloadToken: item.downloadToken,
						downloadTokenExpiresAt: item.downloadTokenExpiresAt,
						renewalCount: item.renewalCount,
						canDownload: !isExpired && !!item.downloadToken, // con !! TypeScript asegura que el valor sea bool 
						isExpired,
					});
				}
			}
		}
		return { course, eBooks };
	}

	// DESCARGAR LIBROS VALIDANDOS CON EL JWT
	
}
