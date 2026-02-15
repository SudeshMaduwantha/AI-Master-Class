'use client';

import { generateTags } from '@/lib/tags';
import Link from 'next/link';
import { useState } from 'react';
import GlassCard from './GlassCard';
import EmailModal from './EmailModal';
import PreviewModal from './PreviewModal';
import { Mail, ExternalLink, Play } from 'lucide-react';

interface FileCardProps {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string | null;
}

export default function FileCard({ id, name, mimeType, webViewLink }: FileCardProps) {
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isVideo = mimeType.startsWith('video/');
    const isFolder = mimeType === 'application/vnd.google-apps.folder';

    // Generate Smart Tags
    const tags = generateTags(name);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        setIsDeleting(true);
        try {
            await fetch('/api/drive/action', {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', fileId: id }),
            });
            window.location.reload(); // Simple reload to refresh list
        } catch (error) {
            alert('Failed to delete file');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRename = async () => {
        const newName = prompt('Enter new name:', name);
        if (!newName || newName === name) return;

        try {
            await fetch('/api/drive/action', {
                method: 'POST',
                body: JSON.stringify({ action: 'rename', fileId: id, name: newName }),
            });
            window.location.reload();
        } catch (error) {
            alert('Failed to rename file');
        }
    };

    if (isDeleting) return null; // Hide card immediately

    return (
        <>
            <GlassCard style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                        ⋮
                    </button>
                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0,
                            background: '#1f1b40', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', zIndex: 10, minWidth: '120px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }} onMouseLeave={() => setIsMenuOpen(false)}>
                            <button onClick={handleRename} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Rename</button>
                            <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                        </div>
                    )}
                </div>

                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 'bold', marginRight: '20px' }}>
                    {isFolder ? <span style={{ marginRight: '5px' }}>📁</span> : (isVideo ? <span style={{ marginRight: '5px' }}>🎥</span> : <span style={{ marginRight: '5px' }}>📄</span>)}
                    {name}
                </div>

                {/* Smart Tags Display */}
                {tags.length > 0 && !isFolder && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.7rem',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                color: 'var(--accent-light)'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', marginBottom: '15px' }}>
                    {isFolder ? 'Folder' : mimeType}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {isFolder ? (
                        <Link
                            href={`/dashboard?folderId=${id}`}
                            className="btn-primary"
                            style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', background: 'var(--accent)' }}
                        >
                            Open
                        </Link>
                    ) : (
                        <>
                            {isVideo ? (
                                <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'var(--accent)' }}
                                >
                                    <Play size={14} /> Watch
                                </button>
                            ) : (
                                webViewLink && (
                                    <a
                                        href={webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}
                                    >
                                        <ExternalLink size={14} /> Open
                                    </a>
                                )
                            )}

                            <button
                                onClick={() => setIsEmailOpen(true)}
                                className="btn-primary"
                                style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                            >
                                <Mail size={14} /> Send
                            </button>
                        </>
                    )}
                </div>
            </GlassCard>

            <EmailModal
                isOpen={isEmailOpen}
                onClose={() => setIsEmailOpen(false)}
                fileLink={webViewLink || '#'}
                fileName={name}
            />

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileId={id}
                mimeType={mimeType}
            />
        </>
    );
}
