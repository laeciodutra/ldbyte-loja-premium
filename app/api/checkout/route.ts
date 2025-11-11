import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  shippingOptionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, shippingOptionId } = checkoutSchema.parse(body);

    // Get cart session
    const sessionId = request.cookies.get("cart-session")?.value;
    if (!sessionId) {
      return NextResponse.json(
        { error: "No cart found" },
        { status: 400 }
      );
    }

    const cartKey = `cart:${sessionId}`;
    const cartData = await redis.get<{ items: { productId: string; quantity: number }[] }>(cartKey);

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Fetch products with current prices
    const productIds = cartData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Validate stock availability
    for (const cartItem of cartData.items) {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${cartItem.productId} not found` },
          { status: 400 }
        );
      }
      if (product.stock < cartItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    let total = cartData.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    // Add shipping cost if provided
    let shippingOption = null;
    if (shippingOptionId) {
      shippingOption = await prisma.shippingOption.findUnique({
        where: { id: shippingOptionId },
      });
      if (shippingOption) {
        total += shippingOption.price;
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        status: "PENDING",
        total,
        shippingOptionId: shippingOptionId || null,
        items: {
          create: cartData.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingOption: true,
      },
    });

    // Update product stock
    for (const cartItem of cartData.items) {
      await prisma.product.update({
        where: { id: cartItem.productId },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });
    }

    // Clear cart
    await redis.del(cartKey);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
