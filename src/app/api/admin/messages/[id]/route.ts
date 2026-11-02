import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead: body.isRead !== undefined ? Boolean(body.isRead) : true,
        replyNotes: body.replyNotes || undefined,
      },
    });

    return apiSuccess(updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui status pesan");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return apiSuccess({ message: "Pesan berhasil dihapus" });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus pesan");
  }
}
