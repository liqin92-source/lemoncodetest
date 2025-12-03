import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim();
  const password = String(body.password || "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 422 }
    );
  }

  const user = db
    .prepare("select * from users where email = ?")
    .get(email) as any;

  if (!user || user.password !== password) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = `token-${user.id}-${Date.now()}`;

  return NextResponse.json({
    access_token: token,
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      status: user.status,
    },
  });
}


