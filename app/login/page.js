'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isSetup, setIsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('COURT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSetup ? 'setup' : 'login',
          username,
          password,
          name,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      if (data.user.role === 'POLICE') {
        router.push('/police');
      } else {
        router.push('/court');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '3rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>
          {isSetup ? '⚙️ ตั้งค่าบัญชีแรกของระบบ' : '🔐 เข้าสู่ระบบติดตามคำร้องฝากขัง'}
        </h2>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSetup && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>ชื่อ-นามสกุล / ตำแหน่ง</label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>รหัสผ่าน (Password)</label>
            <input
              type="password"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSetup && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>สิทธิ์เข้าใช้งาน</label>
              <select
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="COURT">เจ้าหน้าที่ศาล (Court Officer)</option>
                <option value="POLICE">พนักงานสอบสวน (Police Investigator)</option>
                <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'กำลังดำเนินการ...' : isSetup ? 'สร้างบัญชีแรก' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <button
            type="button"
            onClick={() => setIsSetup(!isSetup)}
            style={{ background: 'none', border: 'none', color: '#1e3a8a', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSetup ? 'กลับไปหน้าเข้าสู่ระบบปกติ' : 'เปิดใช้งานครั้งแรก? สร้างบัญชีแรกของระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
}
