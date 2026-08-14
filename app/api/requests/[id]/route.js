import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { receiveOccasion } from '@/lib/caseEngine';

export async function PATCH(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'COURT' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์พิจารณาคำร้อง' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, redNo, courtOrderNote, maxDays } = body; // action: 'ACCEPT', 'REJECT', 'CLOSE'

    const existing = await prisma.remandRequest.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบรายการคำร้อง' }, { status: 404 });
    }

    let updatedData = {};

    if (action === 'ACCEPT') {
      const nextK = existing.currentK + 1;
      const calculatedCase = receiveOccasion({
        startDate: existing.startDate,
        currentK: existing.currentK,
        cumulativeDays: existing.cumulativeDays,
        maxDays: existing.maxDays,
        daysGranted: 12,
        newMaxDays: maxDays || existing.maxDays,
      });

      updatedData = {
        redNo: redNo || existing.redNo,
        currentK: nextK,
        cumulativeDays: calculatedCase.cumulativeDays,
        maxDays: calculatedCase.maxDays,
        status: calculatedCase.closed ? 'CLOSED' : 'ACCEPTED',
        nextOccasionDueDate: calculatedCase.closed ? existing.nextOccasionDueDate : calculatedCase.deadlines.dueDate,
        nextOccasionFilingDate: calculatedCase.closed ? existing.nextOccasionFilingDate : calculatedCase.deadlines.filingDate,
        courtOrderNote: courtOrderNote || existing.courtOrderNote,
      };
    } else if (action === 'REJECT') {
      updatedData = {
        status: 'REJECTED',
        courtOrderNote: courtOrderNote || 'ปฏิเสธคำร้องขอฝากขัง',
      };
    } else if (action === 'CLOSE') {
      updatedData = {
        status: 'CLOSED',
        courtOrderNote: courtOrderNote || 'ปิดคดีเสร็จสิ้นการฝากขัง',
      };
    }

    const updatedRequest = await prisma.remandRequest.update({
      where: { id },
      data: {
        ...updatedData,
        auditLogs: {
          create: {
            action: `COURT_${action}`,
            actorName: user.name,
            actorRole: user.role,
            details: `ศาลดำเนินการ ${action} สำหรับคำร้องคดีฝากขัง ${existing.blackNo}`,
          },
        },
      },
      include: { station: true, attachments: true },
    });

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกผลคำสั่งศาล' }, { status: 500 });
  }
}
