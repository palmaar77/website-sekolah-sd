import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAuth();
    let data: any[] = [];
    try {
      data = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      data = [
        {
          id: "msg-1",
          name: "Rina Sugiarto",
          email: "rina.sugiarto@gmail.com",
          phone: "081234567890",
          subject: "Pertanyaan Kuota Jalur Zonasi",
          message: "Selamat pagi Bapak/Ibu Panitia, apakah radius zonasi mencakup wilayah Kelurahan Harapan Baru RT 04? Terima kasih.",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return apiSuccess(data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengambil pesan");
  }
}
