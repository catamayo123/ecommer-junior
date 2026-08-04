import { Controller, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserRole } from '../../enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DownloadsService } from './downloads.service';

@Controller('downloads')
export class DownloadsController {
	constructor(private readonly downloadsService: DownloadsService) { }

	// LISTAR PRODUCTOS COMPRADOS POR EL USUARIO
	@Get('findAllDownloads')
	@UseGuards(JwtAuthGuard)
	findAllDownloads(@CurrentUser('id') userId: string) {
		return this.downloadsService.findAllDownloads(userId)
	}

	// DESCARGAR EBOOK (valida el token y envia el archivo por streaming, no se expone la URL del archivo)
	@Get('downloadEbook/:orderItemId')
	@UseGuards(JwtAuthGuard)
	async downloadEbook(
		@CurrentUser('id') userId: string,
		@Param('orderItemId') orderItemId: string,
		@Res() res: Response,
	) {
		const filePath = await this.downloadsService.downloadEbook(userId, orderItemId);
		res.download(filePath);
	}

	// ACCEDER/DESCARGAR CURSO (valida compra y envia el archivo por streaming)
	@Get('downloadCourse/:orderItemId')
	@UseGuards(JwtAuthGuard)
	async downloadCourse(
		@CurrentUser('id') userId: string,
		@Param('orderItemId') orderItemId: string,
		@Res() res: Response,
	) {
		const filePath = await this.downloadsService.downloadCourse(userId, orderItemId);
		res.download(filePath);
	}

	// SOLICITAR RENOVACION DE EBOOK
	@Post('renovar/:orderItemId')
	@UseGuards(JwtAuthGuard)
	requestRenewal(@CurrentUser('id') userId: string, @Param('orderItemId') orderItemId: string) {
		return this.downloadsService.requestRenewal(userId, orderItemId)
	}

	// ADMIN CONFIRMA Y PAGA LA RENOVACION
	@Patch('payRenewal/:paymentId/:orderItemId')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.ADMIN)
	payRenewal(
		@Param('paymentId') paymentId: string,
		@Param('orderItemId') orderItemId: string,
		@CurrentUser('id') adminId: string,
	) {
		return this.downloadsService.payRenewal(paymentId, orderItemId, adminId)
	}
}
