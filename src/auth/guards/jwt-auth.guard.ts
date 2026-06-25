import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//AuthGuard('jwt') le dice a nest que use la extrategia jwt, que seria la estrategia JwtStrategy que se aplica en este proyecto
/*
  handleRequest se ejecuta después de que Passport validó el token en la estrategia JwtStrategy. Recibe:

    err → si la JwtStrategy lanzó un error
    user → lo que devolvió el validate de JwtStrategy (o null si no pasó)
*/
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    // Si hay error o el usuario es null → lanza 401 con mensaje "Token inválido o expirado".
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    // si todo va bien, retorno el usuario y la peticion sigue 
    return user;
  }
}
