import { NextResponse } from "next/server";
import db from "@/lib/db";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const row = db
    .prepare(
      "select id, firstname, lastname, email, phone, status from users where id = ?"
    )
    .get(id) as any;

  if (!row) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: row });
}

export async function PUT(request: Request, { params }: Params) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const existing = db
    .prepare("select * from users where id = ?")
    .get(id) as any;
  if (!existing) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const body = await request.json();
  const firstname = String(body.firstname || existing.firstname).trim();
  const lastname = String(body.lastname || existing.lastname).trim();
  const email = String(body.email || existing.email).trim();
  const phone = String(body.phone || existing.phone).trim();
  const status = body.status === "inactive" ? "inactive" : "active";
  const passwordRaw = body.password ? String(body.password).trim() : "";
  const password = passwordRaw || existing.password;

  if (!firstname || !lastname || !email || !phone || !password) {
    return NextResponse.json(
      { message: "firstname, lastname, email, phone and password are required" },
      { status: 422 }
    );
  }

  try {
    db.prepare(
      "update users set firstname = ?, lastname = ?, email = ?, phone = ?, password = ?, status = ? where id = ?"
    ).run(firstname, lastname, email, phone, password, status, id);

    const user = db
      .prepare(
        "select id, firstname, lastname, email, phone, status from users where id = ?"
      )
      .get(id) as any;

    return NextResponse.json({ data: user });
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE constraint failed: users.email")) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 422 }
      );
    }
    return NextResponse.json({ message: "Unable to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const existing = db
    .prepare("select id from users where id = ?")
    .get(id) as any;
  if (!existing) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  try {
    db.prepare("delete from users where id = ?").run(id);
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Unable to delete user" }, { status: 500 });
  }
}


