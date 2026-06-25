import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService, // recibe ConfigService para leer el .dev.env del pryecto
    private readonly usersService: UsersService, // y recibe UsersService para buscar al usuario en la BD cuando llegue un token
  ) {

    // validar en el PassportStrategy que se cumplan las condiciones siguientes 

    /*
     operaciones que se realizan para validarlo 
      1. Toma el token del header
      2. Lo divide en 3 partes separadas por puntos: header.payload.firma
      3. Toma el payload y la firma
      4. Recalcula la firma usando JWT_SECRET
      5. Compara: ¿la firma calculada coincide con la firma que vino en el token?
      ─ Si NO → token inválido, rechaza (401)
      ─ Si SÍ → token válido, ejecuta validate()
    */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Buscar el token en el header Authorization: Bearer EL_TOKEN
      ignoreExpiration: false,                                  // Rechazar tokens vencidos a los de 30 días como se definio
      secretOrKey: configService.get<string>('JWT_SECRET')!,    // clave que esta en .dev.env
    });
  }
  // decidir si el usuario puede pasar o no después de que el token es válidado en el super con PassportStrategy
  async validate(payload: { sub: string; email: string; role: string }) {
    // Busca al usuario en la BD por payload.sub (el ID del usuario)
    const user = await this.usersService.findUserById(payload.sub); 
    // Si no existe return null, status = 401
    if (!user) {
      return null;
    }
    // si todo va bien o sea que existe retorno el objeto y se guarda autoamticamente en request.user
    return { id: user.id, email: user.email, role: user.role, name: user.name };
  }
}
