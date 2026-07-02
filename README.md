1 - FEATURES DEL PROYECTO

Productos: Cursos + eBooks (digitales)
Roles: Cliente | Admin 
Autenticación: JWT + verificación de email (código 4 dígitos simulado por consola en esta version)
Carrito: Persistente en DB, expira 48h sin actividad 
Pago: Simulado ( admin marca como pagado)
Órdenes: Pendiente → Pagado → Completado → Descargado / Cancelado → Reembolsado 
Categorías: Jerárquicas (padre → hijo con parentId)
Productos: Slug auto-generado, isActive para ocultar, descuento temporal, upload de portada   (uploads/portadas/) y archivo (uploads/archivos/)
Entrega: eBook → link JWT 24h por email | Curso → contenido en app con JWT 
Archivos: Subida manual con Multer + ServeStaticModule para servir
Reseñas: Rating 1-5 + comentario , requieren compra completada 
Idioma:          Español (mensajes, comentarios en código)
BD: PostgreSQL + TypeORM con synchronize:true
Documentación:   Swagger en /api
Seguridad: Parámetros vinculados (previene SQL injection),  lista blanca para ordenamiento, JwtAuthGuard + RolesGuard globales
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

FASE 2 — Pendiente (por orden de implementación)
•	CartModule — Carrito persistente (crear, agregar item, quitar item, limpiar, expiración 48h)
•	OrdersModule — Crear orden desde carrito (checkout), historial, cambio de estados
•	PaymentsModule — Admin marca PAYMENT como pagado, transiciona ORDER.status
•	ReviewsModule — Crear reseña (requiere compra completada), listar por producto
•	ProfileModule — Ver/editar perfil, cambiar contraseña, historial de órdenes
•	WishlistModule — Lista de favoritos (opcional)
•	CouponsModule — Códigos de descuento (opcional)
•	DownloadsModule — JWT link para eBooks, acceso a contenido de cursos

FASE 3 — Mejoras (postergado)
•	Reset password con email
•	Notificaciones por email (Nodemailer + Gmail SMTP)
•	Soft delete
•	Rate limiting
•	Health check
•	Migraciones (synchronize:false)
•	Tests

