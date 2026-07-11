// Decorador para saber que rol ocupa el cliente 

import { SetMetadata } from '@nestjs/common'; // es una función de NestJS que permite adjuntar datos (metadata) a una ruta
import { UserRole } from '../../../enum/index';

export const ROLES_KEY = 'roles'; // nombre de la clave con la que se guard el metadata

// crear el decorador Roles al ser de tipo arr de UserRole se puden pasar varios roles en el mismo decorador 
// SetMetadata es una funcion flecha que guarda los roles bajo la clave 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
