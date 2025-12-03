import { NextResponse } from "next/server";
import db from "@/lib/db";

const PER_PAGE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const offset = (page - 1) * PER_PAGE;

  let where = "";
  let params: any[] = [];

  if (search.trim().length > 0) {
    const terms = search.trim().split(/\s+/).filter((t) => t.length > 0);
    if (terms.length > 0) {
      const conditions: string[] = [];
      terms.forEach((term) => {
        const like = `%${term}%`;
        conditions.push(
          "(firstname like ? or lastname like ? or email like ? or phone like ? or (firstname || ' ' || lastname) like ?)"
        );
        params.push(like, like, like, like, like);
      });
      where = `where ${conditions.join(" and ")}`;
    }
  }

  const totalRow = db
    .prepare(`select count(*) as count from users ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(
      `select id, firstname, lastname, email, phone, status from users ${where} order by id desc limit ? offset ?`
    )
    .all(...params, PER_PAGE, offset) as any[];

  const total = totalRow?.count || 0;
  const lastPage = total === 0 ? 1 : Math.ceil(total / PER_PAGE);

  return NextResponse.json({
    data: rows,
    meta: {
      page,
      per_page: PER_PAGE,
      total,
      last_page: lastPage,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const firstname = String(body.firstname || "").trim();
  const lastname = String(body.lastname || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "").trim();
  const status = body.status === "inactive" ? "inactive" : "active";

  if (!firstname || !lastname || !email || !phone || !password) {
    return NextResponse.json(
      { message: "firstname, lastname, email, phone and password are required" },
      { status: 422 }
    );
  }

  try {
    const stmt = db.prepare(
      "insert into users (firstname, lastname, email, phone, password, status) values (?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(firstname, lastname, email, phone, password, status);
    const user = db
      .prepare(
        "select id, firstname, lastname, email, phone, status from users where id = ?"
      )
      .get(result.lastInsertRowid) as any;

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE constraint failed: users.email")) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 422 }
      );
    }
    return NextResponse.json({ message: "Unable to create user" }, { status: 500 });
  }
}


