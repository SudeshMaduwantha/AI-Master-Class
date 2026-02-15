import MasterClassSidebar from '@/components/MasterClassSidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MasterClassLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect('/login');
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a12', // Deep dark background
            color: 'white',
            display: 'flex',
            fontFamily: 'var(--font-geist-sans)',
            overflow: 'hidden' // Contain animations
        }}>
            <MasterClassSidebar />

            <main style={{
                flex: 1,
                marginLeft: '320px', // Significantly increased for safety
                padding: '40px',     // Increased padding for content separation
                position: 'relative',
                zIndex: 1,
                boxSizing: 'border-box',
                minHeight: '100vh'   // Ensure full height background
            }}>
                {/* Tech Background Animation */}
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    opacity: 0.4,
                    pointerEvents: 'none',
                    background: `
                        radial-gradient(circle at 15% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 25%),
                        radial-gradient(circle at 85% 30%, rgba(255, 215, 0, 0.05) 0%, transparent 25%)
                    `
                }}>
                    {/* Animated Grid Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        transform: 'perspective(500px) rotateX(20deg)',
                        transformOrigin: 'top',
                        opacity: 0.3
                    }} />
                </div>

                {children}
            </main>
        </div>
    );
}
