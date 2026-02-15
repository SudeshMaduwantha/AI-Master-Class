'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ActionButtons() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        setIsLoading(true);
        try {
            await fetch('/api/drive/action', {
                method: 'POST',
                body: JSON.stringify({ action: 'createFolder', name: folderName }),
            });
            router.refresh();
        } catch (error) {
            alert('Failed to create folder');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        // Find the upload input in UploadZone and click it
        // This is a bit of a hack, but effective for typical "Quick Action" buttons
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        } else {
            alert('Please check the "Quick Upload" section below.');
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
                onClick={handleUploadClick}
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={isLoading}
            >
                Upload File
            </button>
            <button
                onClick={handleCreateFolder}
                className="btn-primary"
                style={{ flex: 1, background: 'var(--glass-border)' }}
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'New Folder'}
            </button>
        </div>
    );
}
