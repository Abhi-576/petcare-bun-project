import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const changeSchema = z.object({
  date: z.iso.date(),
  isAvailable: z.boolean(),
  note: z.string().max(300).optional(),
});
export async function GET() {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "SITTER") return jsonError("Sitter role required", 403);
  const profile = await prisma.sitterProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ data: [], profileExists: false });
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 90);
  const data = await prisma.availability.findMany({
    where: { sitterId: profile.id, date: { gte: from, lt: to } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ data, profileExists: true });
}
export async function PUT(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Authentication required", 401);
  if (user.role !== "SITTER") return jsonError("Sitter role required", 403);
  try {
    const input = changeSchema.parse(await request.json());
    const profile = await prisma.sitterProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile)
      return jsonError(
        "Create your sitter profile before setting availability",
        409,
      );
    const date = new Date(`${input.date}T00:00:00.000Z`);
    const booking = await prisma.booking.findFirst({
      where: {
        sitterId: profile.id,
        status: {
          in: [
            "ACCEPTED",
            "PAYMENT_PENDING",
            "CONFIRMED",
            "CHECKED_IN",
            "ACTIVE",
          ],
        },
        checkIn: { lt: new Date(date.getTime() + 86400000) },
        checkOut: { gt: date },
      },
      select: { id: true },
    });
    if (booking && input.isAvailable === false)
      return jsonError(
        "This date overlaps a confirmed stay and cannot be marked unavailable",
        409,
      );
    const data = await prisma.availability.upsert({
      where: { sitterId_date: { sitterId: profile.id, date } },
      create: {
        sitterId: profile.id,
        date,
        isAvailable: input.isAvailable,
        note: input.note,
      },
      update: { isAvailable: input.isAvailable, note: input.note },
    });
    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
