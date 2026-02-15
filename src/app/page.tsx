import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

export default function Home() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <GlassCard style={{ maxWidth: '600px', padding: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(to right, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Drive Sync App
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Upload, Manage, and Share your Class Recordings with ease.
          Integrated directly with your Google Drive.
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1.1rem', padding: '12px 32px' }}>
            Get Started
          </Link>
          <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', fontSize: '1.1rem', padding: '12px 32px' }}>
            Go to Dashboard
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
