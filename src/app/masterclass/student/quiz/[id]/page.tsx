'use client';

import { useState, useEffect, use } from 'react';
import { loadQuizAction, saveQuizResultAction } from '../../../quiz/actions';
import { Loader2, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function StudentQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // User Answers State
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await loadQuizAction(id);
                if (res.success && res.quiz) {
                    setQuiz(res.quiz);
                } else {
                    setError(res.error || "Failed to load quiz");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleAnswer = (questionIndex: number, answer: string) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        let correctCount = 0;

        quiz.questions.forEach((q: any, i: number) => {
            if (q.type === 'mcq') {
                if (answers[i] === q.answer) {
                    correctCount++;
                }
            }
            // For short answer, we might need manual grading or AI grading later.
            // For now, let's just mark it as 'needs review' or basic string match if possible?
            // Let's stick to MCQ auto-grading primarily.
        });

        const calculatedScore = (correctCount / quiz.questions.filter((q: any) => q.type === 'mcq').length) * 100;
        const finalScore = Math.round(calculatedScore);
        setScore(finalScore);
        setSubmitted(true);

        if (finalScore > 70) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        // Save Result
        // Ideally we ask for student name or get it from context. For now using 'Student'.
        // We could add an input for name before starting the quiz in a future update.
        try {
            await saveQuizResultAction(quiz.id, "Student", finalScore, answers);
        } catch (e) {
            console.error("Failed to save result", e);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'white' }}>
            <Loader2 className="animate-spin" size={48} color="#a78bfa" />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#ef4444' }}>
            <div style={{ textAlign: 'center' }}>
                <XCircle size={48} style={{ margin: '0 auto 20px' }} />
                <h2>Error Loading Quiz</h2>
                <p>{error}</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px 20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {quiz.title || "MasterClass Quiz"}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Test your knowledge</p>
                </header>

                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(244, 114, 182, 0.2))',
                            padding: '30px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            marginBottom: '40px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <Award size={48} color="#FFD700" style={{ margin: '0 auto 10px' }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your Score: {score}%</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                            {score === 100 ? "Perfect Score! You're a Master!" : score > 70 ? "Great job! Keep it up." : "Keep studying, you'll get there!"}
                        </p>
                    </motion.div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {quiz.questions.map((q: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '30px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '0.9rem'
                                }}>
                                    {i + 1}
                                </span>
                                <h3 style={{ fontSize: '1.2rem', lineHeight: '1.5', flex: 1 }}>{q.question}</h3>
                            </div>

                            {q.type === 'mcq' && (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {q.options.map((opt: string, j: number) => {
                                        const isSelected = answers[i] === opt;
                                        const isCorrect = q.answer === opt;
                                        const showResult = submitted;

                                        let bgColor = 'rgba(255,255,255,0.05)';
                                        let borderColor = 'transparent';

                                        if (showResult) {
                                            if (isCorrect) {
                                                bgColor = 'rgba(34, 197, 94, 0.2)';
                                                borderColor = '#22c55e';
                                            } else if (isSelected && !isCorrect) {
                                                bgColor = 'rgba(239, 68, 68, 0.2)';
                                                borderColor = '#ef4444';
                                            }
                                        } else if (isSelected) {
                                            bgColor = 'rgba(167, 139, 250, 0.2)';
                                            borderColor = '#a78bfa';
                                        }

                                        return (
                                            <div
                                                key={j}
                                                onClick={() => handleAnswer(i, opt)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    background: bgColor,
                                                    border: `1px solid ${borderColor}`,
                                                    cursor: submitted ? 'default' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    border: `2px solid ${showResult && isCorrect ? '#22c55e' : (isSelected ? '#a78bfa' : 'rgba(255,255,255,0.3)')}`,
                                                    background: isSelected || (showResult && isCorrect) ? (showResult && isCorrect ? '#22c55e' : '#a78bfa') : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {showResult && isCorrect && <CheckCircle size={12} color="white" />}
                                                </div>
                                                <span>{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {q.type === 'short' && (
                                <div>
                                    <textarea
                                        placeholder={submitted ? "Your answer..." : "Type your answer here..."}
                                        value={answers[i] || ''}
                                        onChange={(e) => handleAnswer(i, e.target.value)}
                                        disabled={submitted}
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            resize: 'vertical',
                                            outline: 'none'
                                        }}
                                    />
                                    {submitted && (
                                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '12px', borderLeft: '3px solid #a78bfa' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#a78bfa', marginBottom: '5px', fontWeight: 'bold' }}>Model Answer:</p>
                                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    ))}
                </div>

                {!submitted && (
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                padding: '16px 48px',
                                background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(167, 139, 250, 0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Submit Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
