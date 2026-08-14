'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoogleConnectModal from '@/components/GoogleConnectModal';

export default function CourtDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [redNo, setRedNo] = useState('');
  const [maxDays, setMaxDays] = useState(84);
  const [courtNote, setCourtNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

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

  const handleCourtAction = async (action) => {
    if (!selectedReq) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/requests/${selectedReq.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action,
          redNo,
          courtOrderNote: courtNote,
          maxDays: selectedReq.currentK === 4 ? parseInt(maxDays) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกคำสั่งศาล');

      setSelectedReq(null);
      setRedNo('');
      setCourtNote('');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>🏛️ ระบบตรวจรับและพิจารณาคำร้องฝากขัง (เจ้าหน้าที่ศาล)</h2>
          <p style={{ color: '#64748b' }}>ศาลจังหวัดอุดรธานี</p>
        </div>
        <button
          className="btn"
          style={{ backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          onClick={() => setShowGoogleModal(true)}
        >
          📊 เชื่อมต่อ Google Sheet & Drive API
        </button>
      </div>

      <GoogleConnectModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>📥 รายการคำร้องรอศาลตรวจรับและคำสั่ง</h3>
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>ไม่มีรายการคำร้องฝากขังในระบบ</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>เลขคดีดำ / แดง</th>
                <th>ผู้ต้องหา</th>
                <th>ข้อหา</th>
                <th>สถานีตำรวจ</th>
                <th>ครั้งที่ฝาก</th>
                <th>วันครบกำหนดฝากขัง</th>
                <th>สถานะ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 'bold' }}>
                    {r.blackNo} {r.redNo ? `/ ${r.redNo}` : ''}
                  </td>
                  <td>{r.suspectName}</td>
                  <td>{r.charge}</td>
                  <td>{r.station?.name || 'สภ.'}</td>
                  <td>ครั้งที่ {r.currentK}</td>
                  <td style={{ color: '#dc2626', fontWeight: 'bold' }}>
                    {new Date(r.nextOccasionDueDate).toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status === 'SUBMITTED' ? 'รอศาลตรวจรับ' : r.status === 'ACCEPTED' ? 'อนุญาตแล้ว' : r.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedReq(r)}>
                      พิจารณา
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedReq && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '550px', maxWidth: '95%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚖️ พิจารณาคำร้องขอฝากขัง</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
              คดีดำ: {selectedReq.blackNo} | ผู้ต้องหา: {selectedReq.suspectName} (ฝากขังครั้งที่ {selectedReq.currentK})
            </p>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>เลขคดีแดง (ถ้ามี)</label>
              <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc' }} value={redNo} onChange={(e) => setRedNo(e.target.value)} placeholder="เช่น ฝผ.12/2569" />
            </div>

            {selectedReq.currentK === 4 && (
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.375rem', border: '1px solid #f59e0b' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem', color: '#b45309' }}>⚠️ เลือกกำหนดเพดานวันฝากขังสูงสุดสำหรับคดีนี้ (ครั้งที่ 4)</label>
                <select style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', borderRadius: '0.25rem' }} value={maxDays} onChange={(e) => setMaxDays(e.target.value)}>
                  <option value={48}>48 วัน (อัตราโทษจำคุกอย่างสูงไม่เกิน 10 ปี / ครั้งที่ 4 เป็นครั้งสุดท้าย)</option>
                  <option value={84}>84 วัน (อัตราโทษจำคุกอย่างสูงเกิน 10 ปีขึ้นไป / ฝากต่อได้สูงสุด 7 ครั้ง)</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.85rem' }}>หมายเหตุคำสั่งศาล</label>
              <textarea style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc', height: '70px' }} value={courtNote} onChange={(e) => setCourtNote(e.target.value)} placeholder="อนุญาตตามขอ..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => setSelectedReq(null)} style={{ background: '#e2e8f0' }}>ยกเลิก</button>
              <button type="button" className="btn" onClick={() => handleCourtAction('REJECT')} style={{ background: '#dc2626', color: '#fff' }} disabled={processing}>ปฏิเสธคำร้อง</button>
              <button type="button" className="btn btn-primary" onClick={() => handleCourtAction('ACCEPT')} disabled={processing}>{processing ? 'กำลังบันทึก...' : 'อนุญาตตามขอ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
