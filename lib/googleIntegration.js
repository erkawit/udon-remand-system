// lib/googleIntegration.js
// โมดูลรองรับการเชื่อมต่อกับ Google Apps Script (GAS) Web App Endpoint, Google Sheet และ Google Drive Target Folder

export async function callGoogleAppsScript(action, payload = {}, config = {}) {
  const scriptUrl = config.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    console.warn('⚠️ ไม่พบ GOOGLE_APPS_SCRIPT_URL ใช้ข้อมูลจำลองในระบบ');
    return { success: false, reason: 'ไม่ได้ตั้งค่า Web App URL' };
  }

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch (error) {
    console.error('Error calling Google Apps Script:', error);
    return { success: false, error: error.message };
  }
}

export async function uploadToGoogleDriveFolder(fileBuffer, fileName, mimeType = 'application/pdf', config = {}) {
  const scriptUrl = config.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL;
  const folderId = config.driveFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (scriptUrl) {
    const base64Content = fileBuffer.toString('base64');
    const result = await callGoogleAppsScript('uploadFile', {
      fileName,
      mimeType,
      fileBase64: base64Content,
      folderId,
    }, config);

    if (result.success || result.fileId) {
      return {
        fileId: result.fileId || result.id,
        webViewLink: result.webViewLink || result.url || `#`,
      };
    }
  }

  // Fallback / Return structured file metadata
  return {
    fileId: `drive_${Date.now()}`,
    webViewLink: `https://drive.google.com/file/d/dummy_${Date.now()}/view`,
  };
}
