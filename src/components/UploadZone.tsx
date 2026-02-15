'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadZone({ folderId, folderName }: { folderId?: string, folderName?: string }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) {
            formData.append('folderId', folderId);
        }

        try {
            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            router.refresh();
            alert('File uploaded successfully!');
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: '2px dashed',
                borderColor: isDragging ? 'var(--accent)' : 'var(--glass-border)',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '20px',
                cursor: isUploading ? 'default' : 'pointer',
                background: isDragging ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={isUploading}
            />

            {/* Folder Context Indicator */}
            <div style={{ position: 'absolute', top: '10px', left: '0', right: '0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {folderName ? `Uploading to: ${folderName}` : 'Uploading to: Root / Default'}
            </div>

            <AnimatePresence mode="wait">
                {isUploading ? (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '15px' }}
                    >
                        <Loader2 className="animate-spin" size={40} color="var(--accent)" />
                        <p>Uploading...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '15px' }}
                    >
                        <UploadCloud size={40} color={isDragging ? 'var(--accent)' : 'var(--text-secondary)'} />
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isDragging ? 'Drop it here!' : 'Drag & Drop files here, or click to select'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
