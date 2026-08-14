'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STATIONS = [
  "สภ.เมืองอุดรธานี","สภ.กุมภวาปี","สภ.หนองหาน","สภ.เพ็ญ","สภ.บ้านผือ",
  "สภ.บ้านดุง","สภ.ศรีธาตุ","สภ.น้ำโสม","สภ.หนองวัวซอ","สภ.กุดจับ",
  "สภ.โนนสะอาด","สภ.ทุ่งฝน","สภ.วังสามหมอ","สภ.สร้างคอม","สภ.ไชยวาน",
  "สภ.หนองแสง","สภ.กลางใหญ่","สภ.บ้านเทื่อม","สภ.พิบูลย์รักษ์","สภ.ดงเย็น",
  "สภ.นายูง","สภ.กู่แก้ว","สภ.ประจักษ์ศิลปาคม",
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal'); // 'police' | 'court'

  const [role, setRole] = useState(portalParam || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Court Login / Setup Form State
  const [courtUsername, setCourtUsername] = useState('');
  const [courtPassword, setCourtPassword] = useState('');
  const [showForgotNote, setShowForgotNote] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  // Police Login Form State
  const [policeStation, setPoliceStation] = useState(STATIONS[0]);
  const [policeName, setPoliceName] = useState('');
  const [policePassword, setPolicePassword] = useState('');

  useEffect(() => {
    if (portalParam) {
      setRole(portalParam);
    }
  }, [portalParam]);

  const handleCourtLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: courtUsername.trim(),
          password: courtPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      router.push('/court');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFirstCourt = async (e) => {
    e?.preventDefault();
    setError('');

    if (setupPassword !== setupConfirm) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          username: setupName.trim(),
          name: setupName.trim(),
          password: setupPassword,
          role: 'COURT',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างบัญชี');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      router.push('/court');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePoliceLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username: policeName.trim(),
          password: policePassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      router.push('/police');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. หน้าเลือกพอร์ทัล (Portal Selection Screen)
  if (!role) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ maxWidth: '32rem', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚖️</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1B2A41', marginBottom: '0.25rem' }}>ระบบติดตามคำร้องขอฝากขัง</h2>
          <p style={{ fontSize: '0.875rem', color: '#8A836B', marginBottom: '1.75rem' }}>ศาลจังหวัดอุดรธานี — เลือกช่องทางเข้าใช้งานของท่าน</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setRole('police'); setError(''); }}
              style={{
                backgroundColor: '#F4F2E9',
                border: '2px solid #C9C2AC',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🛡️</div>
              <p style={{ fontWeight: 700, color: '#1B2A41', fontSize: '1rem', marginBottom: '0.25rem' }}>พนักงานสอบสวน</p>
              <p style={{ fontSize: '0.75rem', color: '#8A836B' }}>สำหรับเจ้าหน้าที่ตำรวจ 23 สถานีในจังหวัดอุดรธานี</p>
            </button>

            <button
              onClick={() => { setRole('court'); setError(''); }}
              style={{
                backgroundColor: '#F4F2E9',
                border: '2px solid #C9C2AC',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>⚖️</div>
              <p style={{ fontWeight: 700, color: '#1B2A41', fontSize: '1rem', marginBottom: '0.25rem' }}>เจ้าหน้าที่ศาล</p>
              <p style={{ fontSize: '0.75rem', color: '#8A836B' }}>สำหรับเจ้าหน้าที่ศาลจังหวัดอุดรธานี</p>
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#8A836B', lineHeight: '1.5' }}>
            ในระบบจริง ทั้งสองส่วนนี้จะแยกตามโดเมนและเส้นทางสิทธิ์อย่างเคร่งครัด
          </p>
        </div>
      </div>
    );
  }

  // 2. หน้าเข้าสู่ระบบฝั่งศาล (Court Login Screen)
  if (role === 'court') {
    if (isFirstSetup) {
      return (
        <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
          <div className="card" style={{ border: '2px solid #A8762E' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#A8762E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              👤➕ ตั้งค่าบัญชีแรกของระบบ
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#8A836B', marginBottom: '1rem', lineHeight: '1.5' }}>
              ยังไม่มีบัญชีเจ้าหน้าที่ศาลในระบบ — สร้างบัญชีแรกเพื่อเริ่มใช้งานได้เลย (หลังจากนี้จะสร้างบัญชีเพิ่มได้จากหน้า "บัญชีผู้ใช้" หลังล็อกอินเท่านั้น)
            </p>

            {error && <p style={{ fontSize: '0.75rem', color: '#9C3B2E', marginBottom: '0.75rem' }}>{error}</p>}

            <form onSubmit={handleCreateFirstCourt}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>ชื่อ-ตำแหน่ง เจ้าหน้าที่ศาล</label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="เช่น จนท.ศาลจังหวัดอุดรธานี"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>ตั้งรหัสผ่าน</label>
                <input
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                style={{ width: '100%', backgroundColor: '#A8762E', color: '#ffffff', marginTop: '0.5rem' }}
                disabled={loading || !setupName.trim() || !setupPassword}
              >
                {loading ? 'กำลังบันทึก...' : 'สร้างบัญชีแรกและเข้าสู่ระบบ'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsFirstSetup(false)}
              style={{ background: 'none', border: 'none', color: '#3A5A73', fontSize: '0.75rem', textDecoration: 'underline', width: '100%', marginTop: '0.75rem', cursor: 'pointer' }}
            >
              กลับไปหน้าเข้าสู่ระบบปกติ
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1B2A41', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            ⚖️ เข้าสู่ระบบเจ้าหน้าที่ศาล
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#8A836B', marginBottom: '1rem', lineHeight: '1.5' }}>
            บัญชีกลุ่มนี้แยกต่างหากจากบัญชีพนักงานสอบสวนโดยสิ้นเชิง — จัดทำโดยฝ่ายไอทีของศาลตั้งแต่ตั้งระบบ
          </p>

          {error && <p style={{ fontSize: '0.75rem', color: '#9C3B2E', marginBottom: '0.75rem' }}>{error}</p>}

          <form onSubmit={handleCourtLogin}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>ชื่อผู้ใช้</label>
              <input
                type="text"
                value={courtUsername}
                onChange={(e) => setCourtUsername(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>รหัสผ่าน</label>
              <input
                type="password"
                value={courtPassword}
                onChange={(e) => setCourtPassword(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading || !courtUsername || !courtPassword}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowForgotNote(!showForgotNote)}
              style={{ background: 'none', border: 'none', color: '#3A5A73', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              ลืมรหัสผ่าน?
            </button>

            {showForgotNote && (
              <div style={{ marginTop: '0.5rem', padding: '0.625rem', backgroundColor: '#F3E7D2', color: '#5B5540', borderRadius: '0.375rem', fontSize: '0.75rem', textAlign: 'left', lineHeight: '1.5' }}>
                <p><strong>ถ้ามีเจ้าหน้าที่ศาลบัญชีอื่นที่ยังเข้าระบบได้:</strong> ให้เพื่อนร่วมงานล็อกอิน แล้วไปที่หน้า "บัญชีผู้ใช้" กด "ตั้งรหัสผ่านใหม่" ให้บัญชีที่ลืมได้เลย</p>
                <p style={{ marginTop: '0.25rem' }}><strong>ถ้าไม่มีบัญชีอื่นเข้าระบบได้:</strong> ติดต่อฝ่ายไอทีของศาลให้ช่วยรีเซ็ตให้จากฐานข้อมูลโดยตรง</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #C9C2AC', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setRole(null); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#8A836B', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← เปลี่ยนช่องทางเข้าใช้งาน
            </button>
            <button
              type="button"
              onClick={() => { setIsFirstSetup(true); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#A8762E', cursor: 'pointer', textDecoration: 'underline' }}
            >
              เปิดใช้ครั้งแรก? ตั้งค่าบัญชีแรก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. หน้าเข้าสู่ระบบฝั่งตำรวจ (Police Login Screen)
  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1B2A41', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          🛡️ เข้าสู่ระบบพนักงานสอบสวน
        </h3>

        {error && <p style={{ fontSize: '0.75rem', color: '#9C3B2E', marginBottom: '0.75rem' }}>{error}</p>}

        <form onSubmit={handlePoliceLogin}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>
              🏛️ สถานี
            </label>
            <select
              value={policeStation}
              onChange={(e) => { setPoliceStation(e.target.value); setPoliceName(''); }}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem', backgroundColor: '#fff' }}
            >
              {STATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>
              👤 ชื่อ-ยศ พนักงานสอบสวน
            </label>
            <input
              type="text"
              value={policeName}
              onChange={(e) => setPoliceName(e.target.value)}
              placeholder="พิมพ์ชื่อ-ยศของท่าน"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem', backgroundColor: '#fff' }}
              required
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#5B5540', marginBottom: '0.25rem' }}>
              🔒 รหัสผ่าน
            </label>
            <input
              type="password"
              value={policePassword}
              onChange={(e) => setPolicePassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #C9C2AC', fontSize: '0.875rem' }}
              required
            />
            <p style={{ fontSize: '0.7rem', color: '#8A836B', marginTop: '0.25rem' }}>
              รับบัญชี/รหัสผ่านจากเจ้าหน้าที่ศาลจังหวัดอุดรธานี
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading || !policeName || !policePassword}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #C9C2AC', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setRole(null); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#8A836B', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← เปลี่ยนช่องทางเข้าใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
}
