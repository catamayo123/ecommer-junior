1 - FEATURES DEL PROYECTO

Productos: Cursos + eBooks (digitales)

Roles: Cliente | Admin
 
Autenticación: JWT + verificación de email (código 4 dígitos simulado por consola en esta version)

Carrito: Persistente en DB, expira 30 días sin actividad, priceAtPurchase y totales calculados en vivo

Pago: Simulado (admin marca como pagado), entidad PAYMENT separada (OneToOne con Order)

Órdenes: Pendiente → Pagado → Completado → Descargado / Cancelado → Reembolsado. ORDER_ITEM congela precio y genera downloadToken JWT 24h

Categorías: Jerárquicas (padre → hijo con parentId)

Productos: Slug auto-generado, isActive para ocultar, descuento temporal, upload de portada (uploads/portadas/) y archivo (uploads/archivos/)

Entrega: eBook → link JWT 24h por email | Curso → contenido en app con JWT

Archivos: Subida manual con Multer + ServeStaticModule para servir

Cupones: Códigos de descuento creados por admin, aplicables al carrito

Reseñas: Rating 1-5 + comentario, requieren compra completada

Perfil: Ver/editar datos propios, cambiar contraseña, historial de órdenes

Favoritos: Lista de deseos por usuario (opcional)
 
Idioma: Español (mensajes, comentarios en código)

BD: PostgreSQL + TypeORM con synchronize:true

Documentación: Swagger en /api

Seguridad: Parámetros vinculados (previene SQL injection), lista blanca para ordenamiento, JwtAuthGuard + RolesGuard globales

Admin: Mismos endpoints + @Roles(UserRole.ADMIN), paginación y filtros también disponibles para admin en /api/products/admin/all

2 - FASES DEL PROYECTO
FASE 1 — Core
•	ConfigModule + TypeORM + PostgreSQL + ServeStaticModule
•	 UsersModule (entity, service)
•	AuthModule (register, verify-email, login, JWT, guards, decorators)
•	CategoriesModule (CRUD jerárquico, slug)
•	UsersController (CRUD admin de usuarios)
•	ProductsModule (CRUD, filtros, paginación, upload, slug, isActive)
•	Swagger configurado
•	setup.ps1
•	Carpetas uploads/portadas y uploads/archivos

FASE 2 — Carrito y Órdenes (pendiente)
•	CartModule — Carrito persistente (CRUD, expiración 30 días, priceAtPurchase, totales vivos)
•	CouponsModule — Códigos de descuento creados por admin, integrados con carrito
•	OrdersModule — Crear orden desde carrito (checkout), historial, flujo de estados (pending→paid→completed→downloaded /       cancelled→refunded)
•	PaymentsModule — Admin marca PAYMENT como pagado (entidad separada OneToOne con Order), transiciona ORDER.status
•	ReviewsModule — Crear reseña (requiere compra completada), listar por producto, admin puede eliminar

FASE 3 — Perfil y UX (pendiente)
•	ProfileModule — Ver/editar perfil propio, cambiar contraseña, historial de órdenes
•	WishlistModule — Lista de favoritos (opcional)
•	DownloadsModule — JWT link 24h para eBooks, acceso a contenido de cursos

FASE 4 — Pulido (postergado)
•	Reset password con email
•	Notificaciones por email (Nodemailer + Gmail SMTP)
•	Soft delete
•	Rate limiting
•	Health check
•	Migraciones (synchronize: false)
•	Tests

