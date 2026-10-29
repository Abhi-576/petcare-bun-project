import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]),
  resolutionNote: z.string().max(2000).optional(),
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
    const data = await prisma.report.update({
      where: { id },
      data: {
        status: input.status,
        resolutionNote: input.resolutionNote,
        resolvedAt: ["RESOLVED", "DISMISSED"].includes(input.status)
          ? new Date()
          : null,
      },
    });
    return NextResponse.json({ data });
  } catch (e) {
    return handleApiError(e);
  }
}
