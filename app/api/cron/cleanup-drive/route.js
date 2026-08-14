import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deleteFileFromDrive } from '@/googleDrive';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const CRON_SECRET = process.env.CRON_SECRET || 'udon-cron-secret-key-2026';

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized Cron Execution' }, { status: 401 });
    }

    const now = new Date();
    const expiredAttachments = await prisma.attachment.findMany({
      where: {
        autoDeleteAt: { lte: now },
      },
    });

    let deletedCount = 0;
    for (const item of expiredAttachments) {
      try {
        await deleteFileFromDrive(item.driveFileId);
        await prisma.attachment.delete({ where: { id: item.id } });
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete expired drive file ${item.driveFileId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `ดำเนินการสแกนและลบไฟล์คำร้องหมดอายุ 12 วันแล้ว ทั้งหมด ${deletedCount} รายการ`,
    });
  } catch (error) {
    console.error('Cron cleanup drive error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการรัน Cron Job ลบไฟล์' }, { status: 500 });
  }
}
