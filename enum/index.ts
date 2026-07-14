// Roles que puede tener el usuario
export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

// Tipos de productos digitales
export enum ProductType {
  COURSE = 'course',
  EBOOK = 'ebook',
}

// Estados por los que transita una Orden
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Estados que puede tener un Pago
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}