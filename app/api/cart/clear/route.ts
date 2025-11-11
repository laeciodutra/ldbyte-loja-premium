import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("cart-session")?.value;

    if (sessionId) {
      const cartKey = `cart:${sessionId}`;
      await redis.del(cartKey);
    }

    return NextResponse.json(
      { success: true, message: "Cart cleared" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
