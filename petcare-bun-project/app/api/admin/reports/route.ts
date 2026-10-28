import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  reportedUserId: z.string().optional(),
  bookingId: z.string().optional(),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(4000),
});
export async function GET() {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "ADMIN") return jsonError("Admin role required", 403);
  const data = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ data });
}
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  try {
    const input = schema.parse(await request.json());
    if (input.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { sitter: true },
      });
      if (!booking) return jsonError("Booking not found", 404);
      if (
        user.role !== "ADMIN" &&
        booking.ownerId !== user.id &&
        booking.sitter.userId !== user.id
      )
        return jsonError("Forbidden", 403);
    }
    const data = await prisma.report.create({
      data: { ...input, reporterId: user.id },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
