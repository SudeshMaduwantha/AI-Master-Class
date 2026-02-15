'use client';

import { useState, useEffect } from 'react';
import { generateQuizAction, saveQuizToDrive, chatTutorAction, getSavedQuizzesAction, loadQuizAction } from './actions';
import { Loader2, Brain, CheckCircle, HelpCircle, FileText, Link as LinkIcon, Upload, Save, Share2, MessageCircle, X, Send, History } from 'lucide-react';
import { clsx } from 'clsx';

export default function QuizGeneratorPage() {
    const [mode, setMode] = useState<'text' | 'pdf' | 'url'>('text');
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [quiz, setQuiz] = useState<any>(null);
    const [numQuestions, setNumQuestions] = useState(5);

    // Save/Share State
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; fileId?: string } | null>(null);

    // AI Tutor State
    const [activeTab, setActiveTab] = useState<'quiz' | 'chat'>('quiz');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setQuiz(null);
        setSaveStatus(null); // Reset save status on new generation

        try {
            let input = inputText;
            let inputType: 'text' | 'url' | 'pdf' = mode;

            // CLIENT-SIDE PDF EXTRACTION
            if (mode === 'pdf') {
                if (!selectedFile) {
                    alert("Please select a PDF file first.");
                    setIsLoading(false);
                    return;
                }

                try {
                    console.log("[Client] Extracting PDF text...");
                    // Dynamically import pdfjs-dist
                    const pdfjsLib = await import('pdfjs-dist');

                    // Use inline worker to avoid CDN/network issues
                    // @ts-ignore
                    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                        'pdfjs-dist/build/pdf.worker.min.mjs',
                        import.meta.url
                    ).toString();

                    // Read file as ArrayBuffer
                    const arrayBuffer = await selectedFile.arrayBuffer();

                    // Load PDF document
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = '';

                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    console.log(`[Client] Extracted ${fullText.length} characters from PDF`);
                    input = fullText;
                    inputType = 'text'; // Send as text to server
                    setInputText(fullText); // Save context for Chat
                } catch (err: any) {
                    console.error("[Client] PDF Extraction Error:", err);
                    alert(`Failed to extract text from PDF: ${err.message}`);
                    setIsLoading(false);
                    return;
                }
            }

            const result = await generateQuizAction(input, inputType, numQuestions);

            if (result.error) {
                alert(result.error);
            } else {
                setQuiz(result);
            }
        } catch (error: any) {
            console.error("Client Error:", error);
            alert(`Error: ${error.message || 'Something went wrong on the client side'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveQuiz = async () => {
        if (!quiz) return;

        const title = prompt("Enter a title for this quiz:", "My New Quiz");
        if (!title) return;

        setIsSaving(true);
        setSaveStatus(null);

        try {
            const result = await saveQuizToDrive(quiz, title);
            if (result.success) {
                setSaveStatus({
                    success: true,
                    message: "Quiz saved to 'MasterClass Quizzes' folder!",
                    fileId: result.fileId || undefined
                });
            } else {
                setSaveStatus({ success: false, message: result.error || "Failed to save quiz." });
            }
        } catch (error) {
            setSaveStatus({ success: false, message: "An unexpected error occurred." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChatSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsChatLoading(true);

        try {
            // Context is either inputText (for Text/URL modes) or we need to capture the PDF text.
            // Note: For PDF, we extracted it in handleGenerate but didn't save it to state efficiently
            // beyond 'input' variable which is local.
            // FIX: We should use 'inputText' if available. If PDF mode, we might need to re-extract 
            // OR better, when generating quiz, save the EXTRACTED text to a state 'contextText'.
            // For now, let's assume 'inputText' holds the content for Text/URL.
            // For PDF, we need a way to pass it.
            // TEMPORARY: Use 'inputText' - but for PDF this might be empty if we only set it locally.
            // Let's rely on 'inputText' being set or passed.
            // Actually, in handleGenerate, we set 'input'. We should probably set a 'studyContext' state there.

            const contextToUse = inputText; // Fallback for now. Will improve PDF context in next step.

            // Format history for API (parts: [{text: ...}])
            const apiHistory = chatHistory.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }));

            const result = await chatTutorAction(apiHistory, userMsg, contextToUse);

            if (result.success && result.message) {
                setChatHistory(prev => [...prev, { role: 'model', text: result.message! }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setIsChatLoading(false);
        }
    };


    // Saved Quizzes Logic
    const [showSaved, setShowSaved] = useState(false);
    const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    useEffect(() => {
        if (showSaved) {
            loadSavedQuizzesList();
        }
    }, [showSaved]);

    const loadSavedQuizzesList = async () => {
        setIsLoadingSaved(true);
        const res = await getSavedQuizzesAction();
        if (res.quizzes) {
            setSavedQuizzes(res.quizzes);
        }
        setIsLoadingSaved(false);
    };

    const handleLoadQuiz = async (fileId: string) => {
        setIsLoading(true);
        setShowSaved(false);
        try {
            const res = await loadQuizAction(fileId);
            if (res.success && res.quiz) {
                setQuiz(res.quiz);
                setActiveTab('quiz');
            } else {
                alert(res.error || "Failed to load quiz");
            }
        } catch (e: any) {
            alert("Error loading quiz: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '16px', maxWidth: '100%', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Brain color="#a78bfa" size={32} />
                AI Quiz Generator
            </h1>

            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button
                    onClick={() => setShowSaved(true)}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}
                >
                    <History size={16} /> History
                </button>
            </div>

            {/* Saved Quizzes Modal */}
            {/* Saved Quizzes Modal */}
            {showSaved && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#1a1a2e', width: '500px', maxWidth: '90%',
                        borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Saved Quizzes</h2>
                            <button onClick={() => setShowSaved(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {isLoadingSaved ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Loader2 className="animate-spin" style={{ margin: '0 auto', color: '#a78bfa' }} />
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {savedQuizzes.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No saved quizzes found.</p>
                                ) : (
                                    savedQuizzes.map((q) => (
                                        <div key={q.id}
                                            onClick={() => handleLoadQuiz(q.id)}
                                            style={{
                                                padding: '16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{q.name.replace('.json', '')}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                                {new Date(q.createdTime).toLocaleDateString()} at {new Date(q.createdTime).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Generate quizzes from text, PDFs, or website links instantly.
            </p>

            <div style={{
                display: 'flex',
                flexDirection: window.innerWidth > 1200 ? 'row' : 'column',
                gap: '20px'
            }}>
                {/* Input Section */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'text', label: 'Text', icon: FileText },
                            { id: 'pdf', label: 'PDF Upload', icon: Upload },
                            { id: 'url', label: 'Website Link', icon: LinkIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setMode(tab.id as any); setInputText(''); setSelectedFile(null); }}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: mode === tab.id ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: mode === tab.id ? '#a78bfa' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        minHeight: '380px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {mode === 'text' && (
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your lecture notes here..."
                                style={{ width: '100%', height: '350px', background: 'transparent', border: 'none', color: 'white', resize: 'none', outline: 'none' }}
                            />
                        )}

                        {mode === 'url' && (
                            <div style={{ paddingTop: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.7)' }}>Enter Website URL:</label>
                                <input
                                    type="url"
                                    value={inputText || ''}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="https://example.com/article"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                />
                            </div>
                        )}

                        {mode === 'pdf' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', margin: '10px' }}>
                                <Upload size={48} color="rgba(255,255,255,0.3)" style={{ marginBottom: '20px' }} />
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    style={{ display: 'none' }}
                                    id="pdf-upload"
                                />
                                <label htmlFor="pdf-upload" style={{
                                    padding: '12px 24px',
                                    background: 'var(--accent)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                    Select PDF File
                                </label>
                                {selectedFile && <p style={{ marginTop: '15px', color: '#4ade80' }}>Selected: {selectedFile.name}</p>}
                            </div>
                        )}

                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: 'rgba(255,255,255,0.7)' }}>Number of Questions:</label>
                            <select
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            >
                                <option value={5} style={{ color: 'black' }}>5 Questions</option>
                                <option value={10} style={{ color: 'black' }}>10 Questions</option>
                                <option value={15} style={{ color: 'black' }}>15 Questions</option>
                                <option value={20} style={{ color: 'black' }}>20 Questions</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (!inputText && !selectedFile)}
                            style={{
                                marginTop: 'auto',
                                width: '100%',
                                padding: '15px',
                                background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Brain size={20} />}
                            {isLoading ? 'Processing...' : 'Generate Quiz'}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div style={{
                    flex: 1,
                    minWidth: '300px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    minHeight: '380px',
                    maxHeight: '600px',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
                        <button
                            onClick={() => setActiveTab('quiz')}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'quiz' ? '2px solid #a78bfa' : '2px solid transparent',
                                color: activeTab === 'quiz' ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Generated Quiz
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            style={{
                                padding: '10px 20px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'chat' ? '2px solid #a78bfa' : '2px solid transparent',
                                color: activeTab === 'chat' ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <MessageCircle size={16} /> AI Tutor
                        </button>
                    </div>

                    {!quiz && !isLoading && activeTab === 'quiz' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                            <HelpCircle size={48} style={{ marginBottom: '10px' }} />
                            <p>Quiz Preview will appear here</p>
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                            <Loader2 size={48} className="animate-spin" style={{ marginBottom: '10px' }} />
                            <p>Reading content & generating questions...</p>
                        </div>
                    )}

                    {/* Chat Interface */}
                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {chatHistory.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: '40px' }}>
                                        <Brain size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                                        <p>Ask me anything about your notes!</p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        padding: '10px 15px',
                                        borderRadius: '12px',
                                        background: msg.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div style={{ alignSelf: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isChatLoading}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: chatInput.trim() ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        border: 'none',
                                        cursor: chatInput.trim() ? 'pointer' : 'default'
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'quiz' && quiz && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ color: '#a78bfa', margin: 0 }}>Generated Quiz</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {saveStatus && saveStatus.success && (
                                        <a
                                            href={`/masterclass/student/quiz/${saveStatus.fileId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <Share2 size={16} /> Open Student View
                                        </a>
                                    )}
                                    <button
                                        onClick={handleSaveQuiz}
                                        disabled={isSaving}
                                        style={{
                                            background: 'rgba(255, 215, 0, 0.1)',
                                            color: '#FFD700',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            border: '1px solid rgba(255, 215, 0, 0.2)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saveStatus?.success ? "Saved!" : "Save to Drive"}
                                    </button>
                                </div>
                            </div>

                            {saveStatus && !saveStatus.success && (
                                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px' }}>
                                    {saveStatus.message}
                                </div>
                            )}

                            {quiz.questions?.map((q: any, i: number) => (
                                <div key={i} style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '10px' }}>{i + 1}.</span>
                                        {q.question}
                                    </p>

                                    {q.type === 'mcq' && (
                                        <div style={{ display: 'grid', gap: '10px' }}>
                                            {q.options?.map((opt: string, j: number) => (
                                                <div key={j} style={{
                                                    padding: '12px',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '8px',
                                                    border: opt === q.answer ? '1px solid rgba(74, 222, 128, 0.5)' : '1px solid transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <div style={{
                                                        width: '20px', height: '20px', borderRadius: '50%',
                                                        border: '2px solid rgba(255,255,255,0.2)',
                                                        background: opt === q.answer ? '#4ade80' : 'transparent'
                                                    }} />
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'short' && (
                                        <div style={{ padding: '15px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', marginTop: '10px', borderLeft: '3px solid #7c3aed' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#a78bfa', marginBottom: '5px' }}>Model Answer:</p>
                                            <p>{q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
