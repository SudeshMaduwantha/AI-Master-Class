'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: string;
    mimeType: string;
}

export default function PreviewModal({ isOpen, onClose, fileId, mimeType }: PreviewModalProps) {
    if (!isOpen) return null;

    // Transform view link to preview link logic if we had the link, 
    // but we can construct it from ID: https://drive.google.com/file/d/[ID]/preview
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass"
                    style={{ width: '80%', height: '80%', padding: '0', overflow: 'hidden', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10, borderRadius: '50%', padding: '5px' }}>
                        <X size={24} />
                    </button>
                    <iframe
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        allow="autoplay"
                        title="Preview"
                    ></iframe>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
