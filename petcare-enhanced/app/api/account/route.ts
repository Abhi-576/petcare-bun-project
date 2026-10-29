import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  avatarUrl: z.url().nullable().optional(),
});
export async function GET() {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ data });
}
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  try {
    const input = schema.parse(await request.json());
    const data = await prisma.user.update({
      where: { id: user.id },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
