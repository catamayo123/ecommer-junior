import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';
import { UserRole } from '../../enum';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AdminService implements OnModuleInit {
	private readonly logger = new Logger(AdminService.name); // muestra el nombre del servicio

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly userService: UsersService,
		private readonly configService: ConfigService,
	) { }

	// EJECUTAR AUTOMATICAMENTE AL INICIO
	async onModuleInit() {
		await this.createOneAdmin();
	}

	private async createOneAdmin() {
	
		const adminName = this.configService.get<string>('ADMIN_NAME') || 'Administrador';
		const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
		const adminPass = this.configService.get<string>('ADMIN_PASSWORD');

		if (!adminEmail || !adminPass) {
			this.logger.warn('El email o pass no pueden estar vacios. No se pudo crear el admin')
			return;
		}

		const existAdmin = await this.userRepository.findOne({
			where: {role: UserRole.ADMIN}
		})

		if (existAdmin) {
			this.logger.log('Ya existe un admin. No se pudo crear otro')
			return;
		}

		const hashedPass = await bcrypt.hash(adminPass, 10);
		await this.userService.createUser({
			name: adminName,
			email: adminEmail,
			password: hashedPass,
			emailVerified: false,
			role: UserRole.ADMIN,
			verificationCode: null		
		})

		this.logger.log(`Admin creado satisfactoriamente: UserName: ${adminName} y emailUser: ${adminEmail}`)
	}
}
