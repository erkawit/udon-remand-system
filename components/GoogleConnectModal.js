'use client';

import { useState, useEffect } from 'react';

export default function GoogleConnectModal({ isOpen, onClose }) {
  const [webAppUrl, setWebAppUrl] = useState('');
  const [driveFolderId, setDriveFolderId] = useState('');
  const [sheetCsvUrl, setSheetCsvUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWebAppUrl(localStorage.getItem('GOOGLE_WEB_APP_URL') || 'https://script.google.com/macros/s/AKfycbzDTtCr6vJP3nB1mG0w7sXYzUALrhQf2oEYl6VaQAJ3nnyTmqVtPwo0wvxT2aDblRcG/exec');
      setDriveFolderId(localStorage.getItem('GOOGLE_DRIVE_FOLDER_ID') || '1l5ZDlXI14lgFc6WGqmZ3kQ9qB-ci-ArM');
      setSheetCsvUrl(localStorage.getItem('GOOGLE_SHEET_CSV_URL') || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_dummy_pub_csv_placeholder/pub?output=csv');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('GOOGLE_WEB_APP_URL', webAppUrl);
      localStorage.setItem('GOOGLE_DRIVE_FOLDER_ID', driveFolderId);
      localStorage.setItem('GOOGLE_SHEET_CSV_URL', sheetCsvUrl);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '620px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        padding: '2rem',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📊</span> เชื่อมต่อ Google Sheet & Google Drive API
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Notice Info Box */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.625rem',
          padding: '0.875rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#1d4ed8',
          fontSize: '0.9rem'
        }}>
          <span>ℹ️</span>
          <span>ระบบเชื่อมต่อกับ Google Sheet สำหรับบันทึกข้อมูลตาราง <strong>users</strong> และ <strong>data</strong> โดยอัตโนมัติ</span>
        </div>

        {savedSuccess && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            ✓ บันทึกการเชื่อมต่อเรียบร้อยแล้ว
          </div>
        )}

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.375rem' }}>
              🔗 Web App URL (Google Apps Script Endpoint)
            </label>
            <input
              type="text"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbz..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.375rem' }}>
              📁 Google Drive Target Folder ID
            </label>
            <input
              type="text"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              placeholder="1I5ZDIXl14IgFc6WGqmZ3kQ9qB-ci-ArM"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.375rem' }}>
              📊 Google Sheet Published CSV URL (Optional Fallback)
            </label>
            <input
              type="text"
              value={sheetCsvUrl}
              onChange={(e) => setSheetCsvUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            📖 คู่มือการตั้งค่าอย่างรายละเอียด
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#475569',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              💾 บันทึกการเชื่อมต่อ
            </button>
          </div>
        </div>

        {/* Nested Guide Modal */}
        {showGuide && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            padding: '1.5rem',
            overflowY: 'auto',
            zIndex: 10
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>
              📖 ขั้นตอนการตั้งค่า Google Apps Script & Google Sheet
            </h3>
            <ol style={{ fontSize: '0.875rem', color: '#334155', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
              <li>เปิด <strong>Google Sheets</strong> สร้างชีต 2 หน้าชื่อ <code>users</code> และ <code>data</code></li>
              <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
              <li>วางโค้ด Apps Script (<code>doGet</code>/<code>doPost</code>) สำหรับรับคำขออ่าน-บันทึกข้อมูล</li>
              <li>กด <strong>การทบทวนตั้งค่า (Deploy)</strong> &gt; <strong>การทำให้ใช้งานได้ใหม่ (New deployment)</strong></li>
              <li>เลือกประเภทเป็น <strong>เว็บแอป (Web App)</strong> และตั้งค่าสิทธิ์ผู้เข้าถึงเป็น <code>"ทุกคน" (Anyone)</code></li>
              <li>คัดลอก URL ของ Web App และ Folder ID ของ Google Drive มากรอกในหน้านี้</li>
            </ol>
            <button
              onClick={() => setShowGuide(false)}
              style={{ marginTop: '1.25rem', backgroundColor: '#0f172a', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
            >
              ปิดคู่มือ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
