import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createRemandCase, computeOccasionDeadlines } from '@/lib/caseEngine';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

    let whereClause = {};
    if (user.role === 'POLICE') {
      whereClause.stationId = user.stationId;
    } else if (stationId) {
      whereClause.stationId = stationId;
    }

    const requests = await prisma.remandRequest.findMany({
      where: whereClause,
      include: {
        station: true,
        attachments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'POLICE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ยื่นคำร้อง' }, { status: 403 });
    }

    const body = await request.json();
    const { blackNo, suspectName, charge, startDate, reason, driveFileId, fileName, fileUrl } = body;

    if (!blackNo || !suspectName || !charge || !startDate) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลสำคัญให้ครบถ้วน' }, { status: 400 });
    }

    // Compute initial deadlines using caseEngine legal logic
    const start = new Date(startDate);
    const deadlines = computeOccasionDeadlines({
      startDate: start,
      k: 1,
      maxDays: 84,
      cumulativeDays: 0,
    });

    // Create DB Record
    const remandRequest = await prisma.remandRequest.create({
      data: {
        blackNo,
        suspectName,
        charge,
        stationId: user.stationId,
        startDate: start,
        nextOccasionDueDate: deadlines.dueDate,
        nextOccasionFilingDate: deadlines.filingDate,
        reason,
        status: 'SUBMITTED',
        attachments: driveFileId
          ? {
              create: {
                driveFileId,
                fileName: fileName || 'คำร้องขอฝากขัง.pdf',
                fileUrl: fileUrl || '#',
                autoDeleteAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days
              },
            }
          : undefined,
        auditLogs: {
          create: {
            action: 'SUBMIT_REQUEST',
            actorName: user.name,
            actorRole: user.role,
            details: `ยื่นคำร้องฝากขังครั้งที่ 1 สำหรับผู้ต้องหา ${suspectName}`,
          },
        },
      },
      include: {
        station: true,
        attachments: true,
      },
    });

    return NextResponse.json({ success: true, request: remandRequest });
  } catch (error) {
    console.error('Submit request error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกคำร้อง' }, { status: 500 });
  }
}
