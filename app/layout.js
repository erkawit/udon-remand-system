import './globals.css';

export const metadata = {
  title: 'ระบบติดตามคำร้องขอฝากขัง — ศาลจังหวัดอุดรธานี',
  description: 'ระบบติดตามคำร้องขอฝากขังทางจอภาพ ศาลจังหวัดอุดรธานี',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <header style={{ backgroundColor: '#1B2A41', color: '#EAE7DC', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#EAE7DC' }}>ระบบติดตามคำร้องขอฝากขัง</h1>
              <p style={{ fontSize: '0.75rem', color: '#B9C2CE', margin: 0 }}>ศาลจังหวัดอุดรธานี · พอร์ทัลกลาง</p>
            </div>
          </div>
        </header>

        {/* Disclaimer strip */}
        <div style={{
          backgroundColor: '#F3E7D2',
          color: '#6B4A17',
          padding: '0.5rem 1.5rem',
          fontSize: '0.75rem',
          borderBottom: '1px solid #C9C2AC',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span>✓ ใช้กฎ "ยื่นล่วงหน้า 1 วันทำการ" ตามข้อ 5 ระเบียบศาลจังหวัดอุดรธานี ว่าด้วยการฝากขังทางจอภาพ พ.ศ.2569 แล้ว</span>
          <span>ระบบเป็นเพียงเครื่องมือช่วยเตือน พนักงานสอบสวนต้องตรวจสอบกำหนดเวลาด้วยตนเอง</span>
        </div>

        <main>{children}</main>
      </body>
    </html>
  );
}
