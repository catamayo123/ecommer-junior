import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { Repository } from 'typeorm';
import { OrderItemEntity } from '../order/entities/order-item.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { IBaseICourseAndIBook, ICourses, IeBooks } from './interfaces/downloads.interface';
import { OrderStatus, PaymentStatus, ProductType } from '../../enum';

@Injectable()
export class DownloadsService {
	constructor(
		@InjectRepository(OrderEntity)
		private readonly orderRepository: Repository<OrderEntity>,
		@InjectRepository(OrderItemEntity)
		private readonly OrderItemRepository: Repository<OrderItemEntity>,
		@InjectRepository(PaymentEntity)
		private readonly paymentRepository: Repository<PaymentEntity>,
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
	async findAllDownloads(userId: string) {
		const orders = await this.orderRepository.find({
			where: { userId, status: OrderStatus.COMPLETED },
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
					categorySlug: product.category?.slug || 'general',
					purchasedAt: order.completedAt
				}

				if (product.productType === ProductType.COURSE) {
					course.push({
						...baseDownload,
						canAccess: true,
						// la url del curso apunta al endpoint protegido (no expone el archivo)
						urlVideo: `/api/downloads/course/${item.id}`
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

	// DESCARGAR LIBROS VALIDADOS CON EL JWT (devuelve la ruta privada del archivo para enviarlo por streaming)
	async downloadEbook(userId: string, orderItemId: string): Promise<string> {
		// busca el item y si el typo no es un libro, coloco mensaje 
		const item = await this.findOwnedEbookItem(userId, orderItemId, 'Este producto no es un Libro');

		// token valido solo si existe y no vencio
		if (!item.downloadToken || !item.downloadTokenExpiresAt || new Date() > item.downloadTokenExpiresAt) {
			throw new BadRequestException('El token de descarga ha expirado. Solicita una renovación')
		}

		if (!item.product.fileName) {
			throw new NotFoundException('El eBook no tiene un archivo asociado')
		}

		// el archivo vive en private-files (no accesible publicamente), se devuelve su ruta para res.download()
		return this.getPrivateFilePath(item.product.fileName);
	}

	// DESCARGAR/ACCEDER AL CURSO (producto comprado, sin expiracion)
	async downloadCourse(userId: string, orderItemId: string): Promise<string> {
		const item = await this.findOwnedItem(userId, orderItemId);

		if (item.product.productType !== ProductType.COURSE) {
			throw new BadRequestException('Este producto no es un curso')
		}

		if (!item.product.fileName) {
			throw new NotFoundException('El curso no tiene un archivo asociado')
		}

		return this.getPrivateFilePath(item.product.fileName);
	}

	// SOLICITAR RENOVACION: 
	/*
		Si el token vencio entonces se puede renovar
		Solo se renueva una sola vez, si ya el libro se renovo, no se puede hacer mas 
	*/
	async requestRenewal(userId: string, orderItemId: string) {
		// busca un item, si el tipo de producto no es libro coloco el mensaje
		const item = await this.findOwnedEbookItem(userId, orderItemId, 'Solo los eBooks tienen renovación');

		if (item.renewalCount >= 1) {
			throw new BadRequestException('Este eBook ya fue renovado')
		}

		// solo se renueva si el token ya vencio
		if (!item.downloadTokenExpiresAt || new Date() <= item.downloadTokenExpiresAt) {
			throw new BadRequestException('El token aún es válido')
		}

		// si pasa las validaciones se cobra el mismo libro por el 50% de su precio
		const payment = this.paymentRepository.create({
			orderId: item.orderId,
			method: 'simulated',
			status: PaymentStatus.PENDING,
		});
		return await this.paymentRepository.save(payment);
	}

	// ADMIN CONFIRMA EL PAGO DE LA RENOVACION
	/*
		paga y regenera el token SOLO en el orderItemId indicado
	*/
	async payRenewal(paymentId: string, orderItemId: string, adminId: string) {
		const payment = await this.paymentRepository.findOne({
			where: { id: paymentId },
			relations: ['order'],
		});

		if (!payment) {
			throw new NotFoundException('Pago de renovación no encontrado')
		}

		// el pago debe estar pendiente (no puede pagarse dos veces)
		if (payment.status !== PaymentStatus.PENDING) {
			throw new BadRequestException('Este pago ya fue procesado')
		}

		// un pago de renovacion pertenece a una orden YA completada;
		// si la orden esta pendiente seria un pago de compra y no debe tocarse por aqui
		if (payment.order.status !== OrderStatus.COMPLETED) {
			throw new BadRequestException('Solo se pueden pagar renovaciones de órdenes completadas')
		}

		const item = await this.OrderItemRepository.findOne({
			where: { id: orderItemId },
			relations: ['product'],
		});

		if (!item || item.product.productType !== ProductType.EBOOK) {
			throw new BadRequestException('Item no válido para renovación, solo los eBooks se pueden renovar')
		}

		// el item debe pertenecer a la orden de este pago
		if (item.orderId !== payment.orderId) {
			throw new BadRequestException('El eBook no pertenece a la orden de este pago')
		}

		// solo se puede renovar si aun no se habia renovado
		if (item.renewalCount !== 0) {
			throw new BadRequestException('Este eBook ya fue renovado')
		}

		// Guarda el pago
		payment.status = PaymentStatus.PAID;
		payment.paidAt = new Date();
		payment.adminId = adminId;
		await this.paymentRepository.save(payment)

		item.renewalCount = 1;
		// firmar el libro con un token
		item.downloadToken = this.jwtService.sign(
			{ itemId: item.id, orderId: payment.orderId },
			{ expiresIn: '24h' },
		);

		item.downloadTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24H de expiracion
		return await this.OrderItemRepository.save(item);
	}

	// Devuelve el OrderItem de CUALQUIER producto comprado (curso o eBook)
	/* 	
		verificando que exista, pertenezca al usuario y que su orden este completada
	*/
	private async findOwnedItem(userId: string, orderItemId: string): Promise<OrderItemEntity> {
		const item = await this.OrderItemRepository.findOne({
			where: { id: orderItemId },
			relations: ['order', 'product']
		});

		if (!item || item.order.userId !== userId) {
			throw new NotFoundException('Item no encontrado')
		}

		if (item.order.status !== OrderStatus.COMPLETED) {
			throw new BadRequestException('Orden no encontrada')
		}

		return item;
	}

	// Devuelve el OrderItem del eBook
	/* 	
		verificando que exista, pertenezca al usuario, que su orden este completada 
		y que el producto sea un eBook
	*/
	private async findOwnedEbookItem(userId: string, orderItemId: string, ebookMessage: string): Promise<OrderItemEntity> {
		const item = await this.findOwnedItem(userId, orderItemId);

		if (item.product.productType !== ProductType.EBOOK) {
			throw new BadRequestException(ebookMessage)
		}

		return item;
	}

	// Construye la ruta absoluta del archivo en la carpeta privada y valida que exista
	private getPrivateFilePath(fileName: string): string {
		const fullPath = join(__dirname, '..', '..', 'private-files', 'productos', basename(fileName));

		if (!existsSync(fullPath)) {
			throw new NotFoundException('Archivo no encontrado')
		}

		return fullPath;
	}
}
