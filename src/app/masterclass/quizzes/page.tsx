'use client';

import { useState, useEffect } from 'react';
import { getSavedQuizzesAction, getQuizResultsAction } from '../quiz/actions';
import { Loader2, Share2, Eye, FileText, TrendingUp, User, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [results, setResults] = useState<any[]>([]); // Results for active quiz
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        setLoading(true);
        const res = await getSavedQuizzesAction();
        if (res.quizzes) {
            setQuizzes(res.quizzes);
        }
        setLoading(false);
    };

    const handleCopyLink = (fileId: string) => {
        const origin = window.location.origin;
        const link = `${origin}/masterclass/student/quiz/${fileId}`;

        navigator.clipboard.writeText(link);

        if (origin.includes('localhost')) {
            alert('Link Copied! ⚠️ NOTE: This is a localhost link. Students cannot access this unless you are on the same network or you deploy the app (e.g., to Vercel).');
        } else {
            alert('Quiz Link Copied to Clipboard!');
        }
    };

    const handleViewResults = async (quizId: string) => {
        if (activeQuizId === quizId) {
            setActiveQuizId(null); // Toggle off
            return;
        }

        setActiveQuizId(quizId);
        setLoadingResults(true);
        const res = await getQuizResultsAction(quizId);
        if (res.results) {
            setResults(res.results);
        }
        setLoadingResults(false);
    };

    return (
        <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
            <header style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Quiz Management</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>View all your quizzes, share link with students, and track their performance.</p>
            </header>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={40} color="#a78bfa" style={{ margin: '0 auto' }} />
                </div>
            ) : quizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
                    <FileText size={60} style={{ marginBottom: '20px' }} />
                    <p>No quizzes found. Go to <b>Quiz Generator</b> to create one!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {quizzes.map((quiz, index) => (
                        <motion.div
                            key={quiz.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '10px', borderRadius: '12px' }}>
                                        <FileText color="#a78bfa" size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                        {new Date(quiz.createdTime).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {quiz.name.replace('.json', '')}
                                </h3>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button
                                        onClick={() => handleCopyLink(quiz.id)}
                                        style={{
                                            flex: 1, padding: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: 'none', borderRadius: '8px',
                                            color: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}
                                        className="hover:bg-white/10"
                                    >
                                        <Share2 size={16} /> Share
                                    </button>
                                    <button
                                        onClick={() => handleViewResults(quiz.id)}
                                        style={{
                                            flex: 1, padding: '10px',
                                            background: activeQuizId === quiz.id ? '#a78bfa' : 'rgba(167, 139, 250, 0.2)',
                                            border: 'none', borderRadius: '8px',
                                            color: activeQuizId === quiz.id ? 'white' : '#a78bfa',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            fontWeight: 'bold', fontSize: '0.9rem'
                                        }}
                                    >
                                        {activeQuizId === quiz.id ? 'Close' : 'Results'} <TrendingUp size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Scoreboard / Results Section */}
                            <AnimatePresence>
                                {activeQuizId === quiz.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        <div style={{ padding: '20px' }}>
                                            {loadingResults ? (
                                                <div style={{ textAlign: 'center', padding: '10px' }}>
                                                    <Loader2 className="animate-spin" size={20} />
                                                </div>
                                            ) : results.length === 0 ? (
                                                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                                                    No students have taken this quiz yet.
                                                </p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', padding: '0 10px' }}>
                                                        <span>Student</span>
                                                        <span>Score</span>
                                                    </div>
                                                    {results.map((result, i) => (
                                                        <div key={i} style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                                    {result.studentName[0].toUpperCase()}
                                                                </div>
                                                                <span>{result.studentName}</span>
                                                            </div>
                                                            <span style={{
                                                                fontWeight: 'bold',
                                                                color: result.score >= 70 ? '#4ade80' : result.score >= 40 ? '#fbbf24' : '#ef4444'
                                                            }}>
                                                                {result.score}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
