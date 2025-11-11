import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

// Get cart session ID from cookie or create new one
function getCartSessionId(request: NextRequest): string {
  let sessionId = request.cookies.get("cart-session")?.value;
  if (!sessionId) {
    sessionId = nanoid();
  }
  return sessionId;
}

// GET - Retrieve cart
export async function GET(request: NextRequest) {
  try {
    const sessionId = getCartSessionId(request);
    const cartKey = `cart:${sessionId}`;

    // Get cart from Redis
    const cartData = await redis.get<{ items: { productId: string; quantity: number }[] }>(cartKey);

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Fetch product details
    const productIds = cartData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Build cart with product details
    const items = cartData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
      };
    }).filter((item) => item.product); // Remove items with deleted products

    const total = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    const response = NextResponse.json({ items, total });
    response.cookies.set("cart-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve cart" },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = addToCartSchema.parse(body);

    // Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const sessionId = getCartSessionId(request);
    const cartKey = `cart:${sessionId}`;

    // Get existing cart
    const cartData = await redis.get<{ items: { productId: string; quantity: number }[] }>(cartKey) || { items: [] };

    // Update or add item
    const existingItemIndex = cartData.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      cartData.items[existingItemIndex].quantity += quantity;
    } else {
      cartData.items.push({ productId, quantity });
    }

    // Save to Redis with 30 day expiration
    await redis.set(cartKey, cartData, { ex: 60 * 60 * 24 * 30 });

    const response = NextResponse.json(
      { success: true, message: "Item added to cart" },
      { status: 200 }
    );

    response.cookies.set("cart-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    const sessionId = getCartSessionId(request);
    const cartKey = `cart:${sessionId}`;

    const cartData = await redis.get<{ items: { productId: string; quantity: number }[] }>(cartKey);

    if (cartData && cartData.items) {
      cartData.items = cartData.items.filter((item) => item.productId !== productId);
      await redis.set(cartKey, cartData, { ex: 60 * 60 * 24 * 30 });
    }

    return NextResponse.json(
      { success: true, message: "Item removed from cart" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
