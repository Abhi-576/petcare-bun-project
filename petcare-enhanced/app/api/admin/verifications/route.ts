import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
  rejectionReason: z.string().max(1000).optional(),
});
export async function GET() {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "ADMIN") return jsonError("Admin role required", 403);
  const data = await prisma.verification.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          sitterProfile: { select: { id: true, city: true, locality: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ data });
}
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "ADMIN") return jsonError("Admin role required", 403);
  try {
    const input = schema.parse(await request.json());
    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.verification.update({
        where: { id: input.id },
        data: {
          status: input.status,
          rejectionReason:
            input.status === "REJECTED" ? input.rejectionReason : null,
          reviewedAt: new Date(),
          reviewedById: user.id,
        },
        include: {
          user: {
            select: { id: true, sitterProfile: { select: { id: true } } },
          },
        },
      });
      if (record.user.sitterProfile?.id) {
        const kind = record.kind.toLowerCase();
        if (kind.includes("identity"))
          await tx.sitterProfile.update({
            where: { id: record.user.sitterProfile.id },
            data: { identityStatus: input.status },
          });
        else if (kind.includes("address"))
          await tx.sitterProfile.update({
            where: { id: record.user.sitterProfile.id },
            data: { addressStatus: input.status },
          });
        else
          await tx.sitterProfile.update({
            where: { id: record.user.sitterProfile.id },
            data: { homeStatus: input.status },
          });
      }
      return record;
    });
    return NextResponse.json({ data: updated });
  } catch (e) {
    return handleApiError(e);
  }
}
