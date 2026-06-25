import { Injectable, ConflictException, UnauthorizedException, BadRequestException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRARSE CREA USUARIO EN LA BD SIN EL CODIGO DE VERIFICACION DEL CORREO
  async register(registerDTO: RegisterDto) {
    const existingUser = await this.usersService.findUserByEmail(registerDTO.email);
    if (existingUser) {
      // Las excepciones que se manejan aca son propias de nest JS
      throw new ConflictException('El email ya está siendo usado por otro usuario');
    }
    // se coloca 10 por defecto para que sean 4 seg
    const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

    // generando un codigo de 4 digitos para mandar por email
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const user = await this.usersService.createUser({
      name: registerDTO.name,
      email: registerDTO.email,
      password: hashedPassword,
      verificationCode,
    });

    console.log(`[EMAIL SIMULADO] Código de verificación para ${user.email}: ${verificationCode}`);

    return {
      message: 'Usuario registrado. Revisa tu email para verificar tu cuenta.',
      email: user.email,
    };
  }

  // VERIFICAR CODIGO DE 4 DIGITOS PARA POSTERIORMENTE ENTRAR A LA APP
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.findUserByEmail(verifyEmailDto.email);

    // ¿EXISTE EL USUARIO?: si no existe findUserByEmail devuelve null y lanza la excepcion
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    // ¿YA ESTÁ VERIFICADO? si emailVerified = true, ya verifico antes por ende lanza la excepcion
    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }
    // ¿EL CÓDIGO ES CORRECTO? Si user.emailVerified = false, verificar que los codigos de BD mas el que envio sean iguales
    if (user.verificationCode !== verifyEmailDto.code) {
      throw new BadRequestException('Código de verificación incorrecto');
    }
    // Si no entra a ningun if modificar BD
    await this.usersService.updateUser(user.id, {
      emailVerified: true,
      verificationCode: null, // se borra el codigo de la BD para que no hallan intentos de entrar nuevamente con ese codigo
    });

    return { message: 'Email verificado exitosamente' };
  }
  // LOGUEARSE: COMPLIDO LOS PASOS ANTERIORES VERIFICAR
  async login(userLoginDto: LoginDto) {
    const user = await this.usersService.findUserByEmail(userLoginDto.email);
    // valdiar que exista el usuario con ese correo 
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // valdiar que el pass sea correcto contra el pass hasheado de la BD 
    const passwordValid = await bcrypt.compare(userLoginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // validar verifiacion de email
    if (!user.emailVerified) {
      throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');
    }
    // crear un obj con los datos que van dentro del token del jwt
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Crear el token de seguridad jwt
    /*
      sub = "subject" (estándar de JWT) → guarda el ID del usuario
      email y role → necesarios para saber quién es el usuario y qué permisos tiene en el sistema
    */
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
