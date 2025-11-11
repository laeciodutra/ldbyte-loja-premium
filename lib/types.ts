import { Product, Order, OrderItem, Category, ShippingOption } from "@prisma/client";

export type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
  shippingOption: ShippingOption | null;
};

export type ProductWithCategory = Product & {
  category: Category | null;
};
