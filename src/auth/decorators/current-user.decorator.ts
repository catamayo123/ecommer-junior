// Decorador que extraer el usuario autenticado del request sin tener que escribirlo manualmente cada vez.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// createParamDecorator crea un decorador de parámetros personalizado
export const CurrentUser = createParamDecorator(
  // data: el string opcional que pasas (ej: 'email')
  // ctx: el contexto de ejecución (tiene el request, response, etc.)
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // obtiene el request HTTP
    const user = request.user;                       // saca el usuario que puso Passport

    // Si pasaste 'email', devuelve user.email
    // Si no, devuelve el user completo
    return data ? user?.[data] : user;
  },
);
