import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
});
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "ADMIN") return jsonError("Admin role required", 403);
  const { id } = await context.params;
  try {
    const input = schema.parse(await request.json());
    if (id === user.id && input.status !== "ACTIVE")
      return jsonError("You cannot suspend your own admin account", 409);
    const data = await prisma.user.update({
      where: { id },
      data: { status: input.status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    return NextResponse.json({ data });
  } catch (e) {
    return handleApiError(e);
  }
}
