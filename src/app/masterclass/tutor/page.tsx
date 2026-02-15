'use client';

import { useState } from 'react';
import { chatTutorAction } from '../quiz/actions'; // Reuse existing chat action
import { Loader2, Bot, FileText, Link as LinkIcon, Upload, MessageCircle, Send, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiTutorPage() {
    // Input Mode State
    const [mode, setMode] = useState<'text' | 'pdf' | 'url'>('text');
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [context, setContext] = useState(''); // The active study material
    const [isProcessing, setIsProcessing] = useState(false);

    // Chat State
    const [chatStarted, setChatStarted] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleStartChat = async () => {
        setIsProcessing(true);
        try {
            let extractedText = inputText;

            // Handle PDF
            if (mode === 'pdf' && selectedFile) {
                const pdfjsLib = await import('pdfjs-dist');
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
                extractedText = fullText;
            }
            // Handle URL
            else if (mode === 'url' && inputText) {
                // For URL, we technically need the server to fetch it OR just pass the URL and hope the model knows (unlikely for specific content).
                // Reusing the quiz generation logic: we can't easily fetch URL client-side due to CORS.
                // WE will use the text extracted from the URL via a server action if needed, 
                // BUT for now, let's assume the user pastes the content OR we implement a fetch helper.
                // Simplified: User pastes text for now, or we rely on the `chatTutorAction` to handle URL if we modify it.
                // Let's stick to Text/PDF for robustness in this V1 as URL fetching was done inside `generateQuizAction` on server.
                // To support URL here, we'd need a separate `extractUrlAction`. 
                // Let's just pass the URL as context and prompt the model to "browse" if it could (it can't).
                // Better approach: We'll stick to Text/PDF mainly, or treat URL as text input.
            }

            setContext(extractedText);
            setChatStarted(true);
            setChatHistory([{ role: 'model', text: "I've analyzed your notes. What would you like to know?" }]);

        } catch (error) {
            console.error("Context Error:", error);
            alert("Failed to process input.");
        } finally {
            setIsProcessing(false);
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
            // Format history
            const apiHistory = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
            const result = await chatTutorAction(apiHistory, userMsg, context);

            if (result.success && result.message) {
                setChatHistory(prev => [...prev, { role: 'model', text: result.message! }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'model', text: "Error connecting to Tutor." }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div style={{ padding: '0 20px', maxWidth: '1000px', margin: '0 auto', height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bot color="#a78bfa" /> AI Tutor
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Chat with your study materials.</p>
            </motion.div>

            {!chatStarted ? (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        {[{ id: 'text', label: 'Text', icon: FileText }, { id: 'pdf', label: 'PDF', icon: Upload }].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setMode(tab.id as any); setInputText(''); setSelectedFile(null); }}
                                style={{
                                    padding: '12px 24px', borderRadius: '12px',
                                    background: mode === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                    color: 'white', border: 'none', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center'
                                }}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {mode === 'text' && (
                        <textarea
                            value={inputText} onChange={e => setInputText(e.target.value)}
                            placeholder="Paste your notes here..."
                            style={{ width: '100%', maxWidth: '600px', height: '200px', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '20px' }}
                        />
                    )}

                    {mode === 'pdf' && (
                        <div style={{ width: '100%', maxWidth: '600px', height: '200px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <input type="file" accept=".pdf" id="tutor-pdf" hidden onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                            <label htmlFor="tutor-pdf" style={{ cursor: 'pointer', textAlign: 'center' }}>
                                <Upload size={40} style={{ opacity: 0.5, marginBottom: '10px' }} />
                                <p>Click to Upload PDF</p>
                            </label>
                            {selectedFile && <p style={{ color: '#4ade80', marginTop: '10px' }}>{selectedFile.name}</p>}
                        </div>
                    )}

                    <button
                        onClick={handleStartChat}
                        disabled={isProcessing || (!inputText && !selectedFile)}
                        style={{ padding: '15px 40px', background: 'white', color: 'black', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <MessageCircle />}
                        Start Chat Session
                    </button>

                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Chat Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {chatHistory.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    padding: '15px 20px',
                                    borderRadius: '16px',
                                    background: msg.role === 'user' ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    lineHeight: '1.6'
                                }}
                            >
                                {msg.text}
                            </motion.div>
                        ))}
                        {isChatLoading && <Loader2 className="animate-spin" style={{ margin: '20px' }} />}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleChatSubmit} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setChatStarted(false)} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} title="New Chat"><Plus /></button>
                        <input
                            value={chatInput} onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', outline: 'none' }}
                        />
                        <button type="submit" disabled={!chatInput.trim()} style={{ padding: '15px', borderRadius: '12px', background: '#a78bfa', border: 'none', color: 'white', cursor: 'pointer' }}><Send /></button>
                    </form>
                </div>
            )}
        </div>
    );
}
