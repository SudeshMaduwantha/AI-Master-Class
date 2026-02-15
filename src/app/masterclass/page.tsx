import { auth } from '@/auth';
import { getStudentsAction } from './students/actions';
import { Sparkles, Brain, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function MasterClassDashboard() {
    const session = await auth();

    const { students } = await getStudentsAction();
    const studentCount = students ? students.length : '--';

    return (
        <div style={{ padding: '40px 60px' }}>
            <header style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    Welcome, <span style={{ color: '#FFD700' }}>Master {session?.user?.name?.split(' ')[0]}</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '600px' }}>
                    Manage your elite students and content with AI-powered insights.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {/* Stats Card */}
                <Link href="/masterclass/students" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>Total Students</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{studentCount}</div>
                            </div>
                            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <Users color="#FFD700" size={24} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* AI Tool 1 */}
                <Link href="/masterclass/quiz" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.05) 100%)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '20px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Quiz Generator</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Create papers instantly from notes.</p>
                            </div>
                            <div style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '10px', borderRadius: '12px' }}>
                                <Brain color="#a78bfa" size={24} />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#a78bfa' }}>
                            Create New <Sparkles size={14} />
                        </div>
                    </div>
                </Link>

                {/* AI Tool 2 */}
                <Link href="/masterclass/tutor" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(0, 255, 157, 0.02) 100%)',
                        border: '1px solid rgba(0, 255, 157, 0.2)',
                        borderRadius: '20px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>AI Tutor</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Interactive help for students.</p>
                            </div>
                            <div style={{ background: 'rgba(0, 255, 157, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                <TrendingUp color="#34d399" size={24} />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#34d399' }}>
                            Configure Agent <Sparkles size={14} />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
