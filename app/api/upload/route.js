import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFileToDrive } from '@/googleDrive';
import { validateUploadFile } from '@/lib/caseEngine';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนอัพโหลดไฟล์' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์แนบ' }, { status: 400 });
    }

    // Validate size and file type (.pdf, <= 20MB)
    const validation = validateUploadFile({
      fileName: file.name,
      sizeBytes: file.size,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Call Google Drive API module
    const uploadResult = await uploadFileToDrive({
      fileName: file.name,
      fileBuffer: buffer,
      mimeType: file.type || 'application/pdf',
    });

    return NextResponse.json({
      success: true,
      file: uploadResult,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์ลง Google Drive' }, { status: 500 });
  }
}
