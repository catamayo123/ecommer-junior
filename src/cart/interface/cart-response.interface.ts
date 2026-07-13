// Interfaz para que buildCartResponse en carService devuelva un objeto con tipo conocido. 
// Define la forma de un solo item dentro del carrito 
export interface CartItemResponse {
    product: {
        id: string,
        name: string,
        slug: string,
        coverImage: string,
        price: number,
        productType: number,
    } | null, 

    quantity: number,
    unitPrice: number,
    priceAtPurchase: number,
    unitDiscount: number,
    subtotal: number,
    totalDiscount: number,
    total: number,
}

// Define la forma de un carrito completo 
export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  summary: {
    subtotal: number;
    discount: number;
    total: number;
  };
  lastActivity: Date;
  coupon?: {
    code: string;
    discountPercent: number;
    expired?: boolean;
  };
}