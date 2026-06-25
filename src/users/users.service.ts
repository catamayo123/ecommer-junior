import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
   viene con typeScrip al instalar y se puedes usar tambien (Partial, Required, Pick, Omit, etc.)
  */
  async createUser(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // MODIFICAR USUARIO
  async updateUser(id: string, userData: Partial<UserEntity>): Promise<void> {
    await this.userRepository.update(id, userData);
  }
}
