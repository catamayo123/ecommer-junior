1 - FEATURES DEL PROYECTO 

Productos: Cursos + eBooks (digitales)

Roles: Cliente | Admin
 
Autenticación: JWT + verificación de email (código 4 dígitos simulado por consola en esta version)

Carrito: Persistente en DB, expira 30 días sin actividad, priceAtPurchase y totales calculados en vivo

Pago: Simulado (admin marca como pagado), entidad PAYMENT separada (OneToOne con Order)

Órdenes: Pendiente → Completado → Cancelado → Reembolsado. ORDER_ITEM congela precio y genera downloadToken JWT 24h

Categorías: Jerárquicas (padre → hijo con parentId)

Productos: Slug auto-generado, isActive para ocultar, descuento temporal, upload de portada (uploads/portadas/) y archivo (uploads/archivos/)

Entrega: eBook → link JWT 24h por email | Curso → contenido en app con JWT

Archivos: Subida manual con Multer + ServeStaticModule para servir

Cupones: Códigos de descuento creados por admin, aplicables al carrito

Reseñas: Rating 1-5 + comentario, requieren compra completada

Perfil: Ver/editar datos propios, cambiar contraseña, historial de órdenes

Favoritos: Lista de deseos por usuario

BD: PostgreSQL + TypeORM con synchronize:true

Documentación: Swagger en /api

Seguridad: Parámetros vinculados (previene SQL injection), lista blanca para ordenamiento, JwtAuthGuard + RolesGuard globales

Admin: Mismos endpoints + @Roles(UserRole.ADMIN), paginación y filtros también disponibles para admins

2 - FASES DEL PROYECTO

FASE 1 — Core ( LISTO )

•	ConfigModule + TypeORM + PostgreSQL + ServeStaticModule

•	 UsersModule (entity, service, no necesita DTO)

•	AuthModule (register, verify-email, login, JWT, guards, decorators)

•	CategoriesModule (CRUD jerárquico, slug para normalizar)

•	UsersController (CRUD admin de usuarios)

•	ProductsModule (CRUD, filtros, paginación, upload, slug, isActive)

•	Swagger configurado para ver y probar los endpoint desde el nav

•	setup.ps1

•	Carpetas uploads/portadas y uploads/archivos para guardar las imagenes y los archivos en rutas protegidas

FASE 2 — Carrito, Órdenes, Cupones, Pagos y Reseñas ( LISTO )

•	CartModule — Carrito persistente (CRUD, expiración 30 días, priceAtPurchase, totales vivos)

•	CouponsModule — Códigos de descuento creados por admin, integrados con carrito

•	OrdersModule — Crear orden desde carrito (checkout), historial, flujo de estados (pending → completed → cancelled → refunded)

•	PaymentsModule — Admin marca PAYMENT como pagado en esta versión (entidad separada OneToOne con Order)

•	ReviewsModule — Crear reseña (requiere compra completada), listar por producto, admin puede eliminar

FASE 3 — Perfil y UX ( LISTO )

•	ProfileModule — Ver/editar perfil propio, cambiar contraseña, historial de órdenes

•	WishlistModule — Lista de favoritos

•	DownloadsModule — JWT link 24h para eBooks, acceso a contenido de cursos, y posibilidad de renovar al 50% del costo

FASE 4 — Pulido (postergado)

•	Rate limiting — para proteger la API de ataques de fuerza bruta y spam

•	Soft delete par ala proteccion de las relacines en la BD

•	Health check

•	Reset password con email

•	Notificaciones por email (Nodemailer + Gmail SMTP)

•	Tests

•	Migraciones (synchronize: false)


