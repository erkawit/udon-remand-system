'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PoliceDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [blackNo, setBlackNo] = useState('');
  const [suspectName, setSuspectName] = useState('');
  const [charge, setCharge] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(userJson);
    setUser(u);
    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      let driveFileId = null;
      let fileName = null;

      // Upload file to Drive if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
        }

        driveFileId = uploadData.file.id;
        fileName = uploadData.file.name;
      }

      // Submit Request API
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          blackNo,
          suspectName,
          charge,
          startDate,
          reason,
          driveFileId,
          fileName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการยื่นคำร้อง');

      setShowModal(false);
      setBlackNo('');
      setSuspectName('');
      setCharge('');
      setSelectedFile(null);
      fetchRequests();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>🚔 ระบบยื่นคำร้องฝากขังสำหรับพนักงานสอบสวน</h2>
          <p style={{ color: '#64748b' }}>สถานีตำรวจ: {user?.stationName || user?.name || 'พนักงานสอบสวน'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ ยื่นคำร้องขอฝากขังใหม่
        </button>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>📋 รายการคำร้องขอฝากขังที่ยื่นแล้ว</h3>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>ยังไม่มีรายการคำร้องฝากขังที่ยื่น</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>เลขคดีดำ</th>
                <th>ชื่อผู้ต้องหา</th>
                <th>ข้อหา</th>
                <th>ครั้งที่ฝาก</th>
                <th>กำหนดวันต้องยื่นฝากต่อ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 'bold' }}>{r.blackNo}</td>
                  <td>{r.suspectName}</td>
                  <td>{r.charge}</td>
                  <td>ครั้งที่ {r.currentK}</td>
                  <td style={{ color: '#d97706', fontWeight: 'bold' }}>
                    {new Date(r.nextOccasionFilingDate).toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status === 'SUBMITTED' ? 'รอศาลตรวจรับ' : r.status === 'ACCEPTED' ? 'ศาลอนุญาต' : r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>ยื่นคำร้องขอฝากขังใหม่</h3>
            {formError && <div style={{ color: '#dc2626', marginBottom: '0.5rem' }}>{formError}</div>}
            <form onSubmit={handleCreateRequest}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>เลขคดีดำ (เช่น ฝ.123/2569)</label>
                <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }} value={blackNo} onChange={(e) => setBlackNo(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>ชื่อผู้ต้องหา</label>
                <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }} value={suspectName} onChange={(e) => setSuspectName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>ฐานความผิด / ข้อหา</label>
                <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }} value={charge} onChange={(e) => setCharge(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>วันที่เริ่มควบคุมตัว / เริ่มฝากขังครั้งที่ 1</label>
                <input type="date" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>แนบไฟล์คำร้อง PDF (ไม่เกิน 20MB)</label>
                <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#e2e8f0' }}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'กำลังยื่นคำร้อง...' : 'ส่งคำร้อง'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
