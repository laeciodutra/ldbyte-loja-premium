import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const adminSession = request.cookies.get("admin-session");

  if (adminSession?.value === "authenticated") {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
