import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "ADMIN") return jsonError("Admin role required", 403);
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const role = request.nextUrl.searchParams.get("role");
  const status = request.nextUrl.searchParams.get("status");
  const data = await prisma.user.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role && ["OWNER", "SITTER", "ADMIN"].includes(role)
        ? { role: role as "OWNER" | "SITTER" | "ADMIN" }
        : {}),
      ...(status && ["ACTIVE", "SUSPENDED", "DEACTIVATED"].includes(status)
        ? { status: status as "ACTIVE" | "SUSPENDED" | "DEACTIVATED" }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      sitterProfile: {
        select: { id: true, city: true, locality: true, isAvailable: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ data });
}
