import './globals.css';

export const metadata = {
  title: 'ระบบติดตามคำร้องขอฝากขังทางจอภาพ - ศาลจังหวัดอุดรธานี',
  description: 'ระบบติดตามคำร้องขอฝากขัง พนักงานสอบสวนและศาลจังหวัดอุดรธานี',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header style={{ background: '#0f172a', color: '#fff', padding: '1rem', borderBottom: '3px solid #d97706' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>⚖️ ระบบติดตามคำร้องขอฝากขังทางจอภาพ</h1>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ศาลจังหวัดอุดรธานี และสถานีตำรวจในเขตอำนาจ 23 แห่ง</p>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
