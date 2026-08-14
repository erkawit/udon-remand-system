import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, hashPassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, username, password, name, role, stationId } = body;

    // Handle initial setup if no user exists in DB
    if (action === 'setup') {
      const userCount = await prisma.user.count();
      if (userCount > 0) {
        return NextResponse.json(
          { error: 'มีบัญชีในระบบแล้ว ไม่สามารถสร้างผ่านหน้า setup ได้' },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash,
          name,
          role: role || 'COURT',
          stationId: stationId || null,
        },
      });

      const token = signToken({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        stationId: user.stationId,
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, role: user.role, name: user.name },
        token,
      });
    }

    // Normal Login
    const user = await prisma.user.findUnique({
      where: { username },
      include: { station: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      stationId: user.stationId,
      stationName: user.station?.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        stationId: user.stationId,
        stationName: user.station?.name,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
