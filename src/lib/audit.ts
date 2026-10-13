import prisma from "./prisma";

interface LogActivityParams {
  adminId?: string;
  adminName: string;
  action: string;
  details: string;
  ipAddress?: string;
}

/**
 * Catat aktivitas penting admin ke tabel ActivityLog
 */
export async function logActivity({
  adminId,
  adminName,
  action,
  details,
  ipAddress,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        adminId: adminId || null,
        adminName,
        action,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat audit log:", error);
  }
}
