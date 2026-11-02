import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { facilitySchema } from "@/lib/validations/profile";
import { logActivity } from "@/lib/audit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { apiCreated, apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const data = await prisma.facility.findMany({
      orderBy: { order: "asc" },
    });
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error, "Gagal mengambil data fasilitas");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = facilitySchema.safeParse(body);

    if (!parsed.success) {
      return handleApiError(parsed.error);
    }

    const cleanData = {
      ...parsed.data,
      name: sanitizeInput(parsed.data.name),
      description: sanitizeInput(parsed.data.description),
    };

    const item = await prisma.facility.create({
      data: cleanData,
    });

    await logActivity({
      adminId: session.userId,
      adminName: session.name,
      action: "CREATE_FACILITY",
      details: `Menambahkan fasilitas: "${item.name}"`,
    });

    return apiCreated(item, "Fasilitas berhasil ditambahkan.");
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menambahkan fasilitas");
  }
}
