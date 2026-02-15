'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileLink: string;
    fileName: string;
}

export default function EmailModal({ isOpen, onClose, fileLink, fileName }: EmailModalProps) {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState(`Class Recording: ${fileName}`);
    const [message, setMessage] = useState('Here is the recording from today\'s class.');
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, text: message, link: fileLink }),
            });

            if (res.ok) {
                alert('Email sent successfully!');
                onClose();
            } else {
                alert('Failed to send email.');
            }
        } catch (error) {
            console.error(error);
            alert('Error sending email.');
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }} onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{ width: '500px', padding: '30px', position: 'relative' }}
                    >
                        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h2 style={{ marginTop: 0 }}>Send Recording</h2>

                        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>To (Email)</label>
                                <input
                                    type="email" required
                                    className="input-glass"
                                    value={to} onChange={(e) => setTo(e.target.value)}
                                    placeholder="student@example.com"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Subject</label>
                                <input
                                    type="text" required
                                    className="input-glass"
                                    value={subject} onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Message</label>
                                <textarea
                                    className="input-glass"
                                    style={{ resize: 'vertical', minHeight: '100px' }}
                                    value={message} onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={sending} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Send size={16} />
                                {sending ? 'Sending...' : 'Send Email'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
