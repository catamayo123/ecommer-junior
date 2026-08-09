import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { UpdateProfileDTO } from './DTO/update-profile.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly orderService: OrderService
  ) { }

  // BUSCAR EMAIL 
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // BUSCAR USUARIO POR ID
  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // CREAR USUARIO
  /*
   Partial <UserEntity> se usa para que solo se utilicen algunas propiedades de la entidad Usuario, 
   viene con typeScrip y se puedes usar tambien (Partial, Required, Pick, Omit, etc.)
  */
  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // MODIFICAR USUARIO
  async updateUser(id: string, userData: Partial<UserEntity>): Promise<void> {
    await this.userRepository.update(id, userData);
  }

  // LISTAR TODOS LOS USUARIOS
  async findAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  // ELIMINAR USUARIO
  async removeUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /********************** PROFILE **********************/

  // OBETER PERFIL, no se incluye pass ni el codigo de verificacion
  async getProfile(id: string) {
    const user = await this.findUserById(id)
    if (!user) throw new NotFoundException('Usuario no encontrado')
    const { password, verificationCode, ...safeUser } = user;
    return safeUser;
  }

  // ACTUALIZAR PERFIL: nombre || email
  async updateProfile(id: string, data: UpdateProfileDTO) {
    const user = await this.findUserById(id)
    if (!user) throw new NotFoundException('Usuario no encontrado')

    // si cambia el email 	
    if (data.email && data.email !== user.email) {
      // verificar que al menos se envio un pass por body
      if (!data.currentPass) throw new BadRequestException('Confirma el pass para cambiar email')

      const isValid = await bcrypt.compare(data.currentPass, user.password);
      if (!isValid) throw new BadRequestException('El pass actual no es valido')

      const existUserByEmail = await this.findUserByEmail(data.email)
      if (existUserByEmail && existUserByEmail.id !== id) throw new ConflictException('El email esta siendo usado por otro Usuario')

      // reverificacion del email con el codigo
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      await this.updateUser(id, {
        email: data.email,
        emailVerified: false,
        verificationCode
      })

      console.log(`[EMAIL SIMULADO] Código de verificación para ${data.email}: ${verificationCode}`);
    }

    // si cambia el nombre solamente 
    if (data.name && data.name !== user.name) {
      await this.updateUser(id, { name: data.name })
    }

    return this.getProfile(id);
  }

  // CAMBIAR PASS
  async changePassword(id: string, currentPass: string, newPass: string) {
    const user = await this.findUserById(id)

    if (!user) throw new NotFoundException('Usuario no encontrado')

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new BadRequestException('El pass no concide')

    const hashedNewPass = await bcrypt.hash(newPass, 10);
    await this.updateUser(id, { password: hashedNewPass })
    return { message: 'Password actualziado correctamente' }
  }

  // HISTORIAL DE ORDENES 
  async getOrderHistory(userId: string){
    return this.orderService.findAllOrder(userId)
  }
  
}
