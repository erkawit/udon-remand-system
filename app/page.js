'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === 'POLICE') {
          router.push('/police');
          return;
        } else if (user.role === 'COURT' || user.role === 'ADMIN') {
          router.push('/court');
          return;
        }
      } catch (e) {
        // invalid token/user
      }
    }
    router.push('/login');
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p style={{ color: '#64748b' }}>กำลังนำท่านเข้าสู่ระบบ...</p>
    </div>
  );
}
