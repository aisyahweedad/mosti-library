import { NextResponse } from "next/server";

import { sessionFromRequest } from "@/lib/auth";
import {
  addOption,
  listCatalogCategories,
  listKinds,
  removeOption,
  type CatalogGroup,
} from "@/lib/catalog";

export async function GET(request: Request) {
  if (!(await sessionFromRequest(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    kinds: listKinds(),
    categories: listCatalogCategories(),
  });
}

export async function POST(request: Request) {
  const session = await sessionFromRequest(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    group?: unknown;
    value?: unknown;
  } | null;
  const group = body?.group;
  const value = typeof body?.value === "string" ? body.value.trim() : "";

  if (group !== "kind" && group !== "category") {
    return NextResponse.json(
      { error: "Kumpulan tidak sah. Gunakan 'kind' atau 'category'." },
      { status: 400 }
    );
  }
  if (!value) {
    return NextResponse.json(
      { error: "Nilai tidak boleh kosong" },
      { status: 400 }
    );
  }

  addOption(group as CatalogGroup, value);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await sessionFromRequest(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const group = url.searchParams.get("group");
  const value = url.searchParams.get("value") ?? "";

  if (group !== "kind" && group !== "category") {
    return NextResponse.json(
      { error: "Kumpulan tidak sah. Gunakan 'kind' atau 'category'." },
      { status: 400 }
    );
  }
  if (!value) {
    return NextResponse.json(
      { error: "Nilai tidak boleh kosong" },
      { status: 400 }
    );
  }

  removeOption(group as CatalogGroup, value);
  return NextResponse.json({ ok: true });
}
