'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, Bot, Settings, LogOut, Calendar, Brain } from 'lucide-react';

export default function MasterClassSidebar() {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/masterclass', icon: LayoutDashboard },
        { name: 'Students', href: '/masterclass/students', icon: Users },
        { name: 'Attendance', href: '/masterclass/attendance', icon: Calendar },
        { name: 'Quizzes', href: '/masterclass/quizzes', icon: GraduationCap }, // New Quizzes Tab (Management)
        { name: 'Quiz Generator', href: '/masterclass/quiz', icon: Brain }, // Changed icon to distinguish
        { name: 'AI Tutor', href: '/masterclass/tutor', icon: Bot },
    ];

    return (
        <aside style={{
            width: '260px',
            background: 'rgba(20, 20, 35, 0.95)', // Darker, premium background
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 215, 0, 0.1)', // Gold accent border
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            color: 'white',
            zIndex: 100,
            boxSizing: 'border-box' // Ensure padding is included in width
        }}>
            <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)', // Gold gradient
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '5px'
                }}>
                    Master Class
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>PRO EDITION</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? '#141423' : 'rgba(255,255,255,0.7)',
                                background: isActive ? 'linear-gradient(90deg, #FFD700, #FDB931)' : 'transparent',
                                fontWeight: isActive ? '600' : 'normal',
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 4px 15px rgba(255, 215, 0, 0.3)' : 'none'
                            }}
                        >
                            <Icon size={20} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link href="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'color 0.2s',
                    fontSize: '0.9rem'
                }}>
                    <LogOut size={18} />
                    Back to Drive
                </Link>
            </div>
        </aside>
    );
}
