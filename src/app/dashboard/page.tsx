import { auth, signOut } from '@/auth';
import GlassCard from '@/components/GlassCard';
import { listFiles, searchFiles, getFolder } from '@/lib/drive';
import Link from 'next/link';
import UploadZone from '@/components/UploadZone';
import FileCard from '@/components/FileCard';
import ActionButtons from '@/components/ActionButtons';
import StorageWidget from '@/components/StorageWidget';
import { Search, Folder, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { searchParams: Promise<{ folderId?: string, q?: string }> }) {
    const session = await auth();
    const searchParams = await props.searchParams;
    const folderId = searchParams?.folderId;
    const query = searchParams?.q;

    let files = [];
    let currentFolder = null;

    if (query) {
        files = await searchFiles(query);
    } else {
        files = await listFiles(folderId);
        if (folderId) {
            currentFolder = await getFolder(folderId);
        }
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Dashboard</h1>
                        <span style={{ background: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>v2.1</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {session?.user?.name}</p>
                </div>

                <form action={async () => {
                    'use server';
                    await signOut({ redirectTo: "/login" });
                }}>
                    <button className="btn-primary" style={{ background: 'rgba(255, 50, 50, 0.2)' }}>Sign Out</button>
                </form>
            </header>

            {/* Search Bar & Navigation */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                {!query && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none', opacity: folderId ? 0.7 : 1 }}>
                            <Home size={20} style={{ marginRight: '5px' }} /> Home
                        </Link>
                        {folderId && (
                            <>
                                <span style={{ color: 'var(--text-secondary)' }}>/</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Folder size={20} /> {currentFolder ? currentFolder.name : 'Current Folder'}
                                </span>
                            </>
                        )}
                    </div>
                )}

                <form style={{ flex: 1, display: 'flex', gap: '10px', marginLeft: 'auto', maxWidth: '400px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                        <input
                            name="q"
                            type="text"
                            placeholder="Search files..."
                            defaultValue={query}
                            className="input-glass"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </form>
            </div>


            {!query && !folderId && (
                <div style={{ marginBottom: '30px' }}>
                    <Link href="/masterclass" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                            borderRadius: '12px',
                            padding: '16px 30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            color: '#1a1a1a',
                            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '20px' }}>👑</span>
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Master Class Pro</h2>
                            </div>

                            <div style={{
                                background: 'rgba(0,0,0,0.8)',
                                color: '#FFD700',
                                padding: '8px 20px',
                                borderRadius: '100px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Open Dashboard ➜
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {!query && !folderId && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <GlassCard>
                        <h3>Quick Actions</h3>
                        <ActionButtons />
                    </GlassCard>

                    <GlassCard>
                        <h3>Quick Upload</h3>
                        <UploadZone />
                    </GlassCard>

                    <StorageWidget />
                </div>
            )}

            {/* Show Upload Zone in Folder View too, if inside a folder */}
            {folderId && !query && (
                <div style={{ marginBottom: '40px' }}>
                    <GlassCard>
                        <h3>Upload to {currentFolder ? currentFolder.name : 'this folder'}</h3>
                        <UploadZone folderId={folderId} folderName={currentFolder?.name || undefined} />
                    </GlassCard>
                </div>
            )}


            <h2 style={{ marginTop: '0px' }}>
                {query ? `Search Results for "${query}"` : (folderId ? 'Folder Contents' : 'Recent Files')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {files.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>No files found.</p>
                ) : (
                    files.map((file) => (
                        <FileCard
                            key={file.id}
                            id={file.id!}
                            name={file.name!}
                            mimeType={file.mimeType!}
                            webViewLink={file.webViewLink}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
