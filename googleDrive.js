// lib/googleDrive.js
//
// โมดูลเชื่อมต่อ Google Drive API สำหรับระบบติดตามคำร้องขอฝากขัง — ศาลจังหวัดอุดรธานี
// ใช้ Service Account เข้าถึง Shared Drive ขององค์กรศาลเท่านั้น
// ผู้ใช้ (ตำรวจ/เจ้าหน้าที่ศาล) ไม่ต้อง login Google เอง — สิทธิ์การเข้าถึงคุมที่ฐานข้อมูล/แอปเสมอ
// ตามที่ตัดสินใจไว้ใน SPEC.md หัวข้อสถาปัตยกรรม
//
// ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์เท่านั้น (Next.js API route / Server Action)
// ห้าม import ไฟล์นี้จากโค้ดฝั่ง client เด็ดขาด เพราะ credentials จะรั่วไปกับ bundle

import { google } from "googleapis";
import { Readable } from "stream";

// ---------- ตั้งค่าเริ่มต้น ----------
// เก็บ Service Account key เป็น environment variable บน Vercel (Settings > Environment Variables)
// แนะนำเก็บเป็น base64 ของไฟล์ JSON ทั้งไฟล์ (กัน newline ในไฟล์ private_key พังตอน paste ลง env)
// วิธีสร้างค่า: base64 -w0 service-account-key.json  (บน Linux/Mac)
const SERVICE_ACCOUNT_KEY_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
const SHARED_DRIVE_ID = process.env.GOOGLE_SHARED_DRIVE_ID; // ID ของ Shared Drive ขององค์กรศาล (ไม่ใช่ My Drive)
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID; // โฟลเดอร์หลักภายใน Shared Drive ที่จะเก็บไฟล์คำร้องทั้งหมด

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB — ต้องตรงกับ validateUploadFile ใน lib/legalLogic.js เสมอ

function getServiceAccountCredentials() {
  if (!SERVICE_ACCOUNT_KEY_BASE64) {
    throw new Error("ไม่พบ GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 ใน environment variables");
  }
  const jsonString = Buffer.from(SERVICE_ACCOUNT_KEY_BASE64, "base64").toString("utf-8");
  return JSON.parse(jsonString);
}

// สร้าง Drive client ใหม่ทุกครั้งที่เรียก (serverless function แต่ละ instance คนละ process กัน
// แคชไว้ข้ามคำขอไม่ได้แน่นอน จึงไม่ต้องพยายาม cache client ไว้เป็น module-level singleton)
function getDriveClient() {
  const credentials = getServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

/**
 * อัพโหลดไฟล์ PDF คำร้องขึ้น Shared Drive
 * @param {Buffer} fileBuffer เนื้อไฟล์ PDF (จาก request body / formData)
 * @param {string} fileName ชื่อไฟล์ที่จะเก็บ แนะนำใช้เลขคดี+ครั้งที่ เช่น "ฝ.123-2569_ครั้งที่3.pdf"
 * @param {string} mimeType ควรเป็น "application/pdf" เสมอ (เช็คซ้ำจาก validateUploadFile ฝั่ง client/legalLogic.js มาก่อนแล้ว)
 * @returns {Promise<{ fileId: string, webViewLink: string }>}
 */
export async function uploadFileToDrive(fileBuffer, fileName, mimeType = "application/pdf") {
  if (mimeType !== "application/pdf") {
    throw new Error("รับเฉพาะไฟล์ PDF เท่านั้น");
  }
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("ไฟล์มีขนาดเกิน 20 MB");
  }
  if (!ROOT_FOLDER_ID) {
    throw new Error("ไม่พบ GOOGLE_DRIVE_ROOT_FOLDER_ID ใน environment variables");
  }

  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [ROOT_FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true, // จำเป็นเสมอเมื่อทำงานกับ Shared Drive ไม่ใช่ My Drive ธรรมดา
  });

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
  };
}

/**
 * ดาวน์โหลดเนื้อไฟล์กลับมาเป็น Buffer เพื่อ stream ต่อให้ผู้ใช้ผ่าน API route
 * (ไม่ใช้ signed URL สาธารณะ เพราะต้องคุมสิทธิ์ทุกครั้งที่ฝั่งเซิร์ฟเวอร์ตาม SPEC)
 * @param {string} fileId
 * @returns {Promise<Buffer>}
 */
export async function downloadFileFromDrive(fileId) {
  const drive = getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return Buffer.from(response.data);
}

/**
 * ลบไฟล์ออกจาก Drive ถาวร
 * ใช้เรียกจาก 2 จุด: (1) cron job ลบไฟล์อัตโนมัติหลัง 12 วัน (FILE_PURGE_DAYS ใน lib/legalLogic.js)
 *                    (2) ถ้าในอนาคตเพิ่มปุ่ม "ลบไฟล์เอง" ฝั่งเจ้าหน้าที่ศาลตามที่เคยคุยกันไว้
 * @param {string} fileId
 */
export async function deleteFileFromDrive(fileId) {
  const drive = getDriveClient();
  await drive.files.delete({ fileId, supportsAllDrives: true });
}

/**
 * ตัวอย่างการใช้งานใน Next.js API route (App Router):
 *
 * // app/api/cases/[id]/upload/route.js
 * import { uploadFileToDrive } from "@/lib/googleDrive";
 * import { validateUploadFile, uploadFile as recordUploadInDb } from "@/lib/legalLogic";
 *
 * export async function POST(request, { params }) {
 *   const formData = await request.formData();
 *   const file = formData.get("file");
 *   const buffer = Buffer.from(await file.arrayBuffer());
 *
 *   // 1. ตรวจสอบฝั่งเซิร์ฟเวอร์อีกชั้นเสมอ (อย่าเชื่อ client validation อย่างเดียว)
 *   const validation = validateUploadFile(file.name, buffer.length);
 *   if (!validation.ok) {
 *     return Response.json({ ok: false, reason: validation.reason }, { status: 400 });
 *   }
 *
 *   // 2. อัพโหลดขึ้น Drive จริง
 *   const { fileId } = await uploadFileToDrive(buffer, `${params.id}_${file.name}`);
 *
 *   // 3. บันทึกอ้างอิงลง Postgres (fileId, uploadedAt) — เคลียร์ courtFlag ถ้ามีตามตรรกะเดิมใน uploadFile()
 *   const result = await recordUploadInDb(params.id, fileId);
 *
 *   return Response.json(result);
 * }
 *
 * ตัวแปร environment variables ที่ต้องตั้งใน Vercel (ทั้งฝั่ง police และ court project ถ้าแยก 2 โปรเจกต์จริง
 * — ต้องตั้งค่าให้ตรงกันทุกตัวทั้ง 2 ฝั่ง โดยเฉพาะ DATABASE_URL ที่ต้องชี้ไปฐานข้อมูลเดียวกันเสมอ):
 *   GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
 *   GOOGLE_SHARED_DRIVE_ID
 *   GOOGLE_DRIVE_ROOT_FOLDER_ID
 *   DATABASE_URL
 */
