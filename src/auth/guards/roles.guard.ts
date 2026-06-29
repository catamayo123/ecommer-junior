import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // para poder leer que @Roles() se coloco en el controlador 
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  // DEFINIR SI SE PERMITE O NO CONTINUAR CON LA SOLICITUD ACTUAL 
  /*
    canActivate(context : ExecutionContext contexto de la petición actual: request, response, etc. ) 
    interfaz que define el la funcion catActivate, que debe de implementar un guard.
    El valor de retorno indica si se permite o no continuar con la solicitud actual 
    El retorno pude ser sincrono : boolean , o asincrono: una promise  
  */
  canActivate(context: ExecutionContext): boolean {
    // getAllAndOverride() Busca si hay algun @Roles tanto a nivel de metodo como anivel de clase @controller o sea 
    // que requiredRoles guarda si existe un guard o no. 
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // obtiene a nivel de metodo
      context.getClass(),   // obtiene a nivel de clase @COntroller
    ]);

    // si requiredRoles = undefine, deja pasar, o sea no hay guard, en caso contrario bloquea
    if (!requiredRoles) {
      return true;
    }
    
    // Extrae el user del request. Ese user lo puso ahí la JwtStrategy cuando validó el token. 
    const { user } = context.switchToHttp().getRequest(); 
    // Si no hay usuario (petición sin token o token inválido), lanza 403.
    if (!user) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }

    // includes busca dentro del arr @Role si coincide el con el user.role contra el que trae el decorador 
    const hasRole = requiredRoles.includes(user.role);
    // si son diferentes, retorna excepcion   
    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }
    // sino retorna true 
    return true;
  }
}
