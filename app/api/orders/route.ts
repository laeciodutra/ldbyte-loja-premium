import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List orders (admin gets all, customer gets their own)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const status = searchParams.get("status");
    const adminSession = request.cookies.get("admin-session");
    const isAdmin = adminSession?.value === "authenticated";

    const where: any = {};

    // If not admin, require email parameter
    if (!isAdmin) {
      if (!email) {
        return NextResponse.json(
          { error: "Email parameter required" },
          { status: 400 }
        );
      }
      where.customerEmail = email;
    } else {
      // Admin can filter by email
      if (email) {
        where.customerEmail = email;
      }
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingOption: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
