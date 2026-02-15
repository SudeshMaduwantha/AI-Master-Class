import GlassCard from './GlassCard';
import { getStorageQuota } from '@/lib/drive';

export default async function StorageWidget() {
    let usage = { used: 0, limit: 0, usageInDrive: 0, usageInDriveTrash: 0 };

    try {
        const quota = await getStorageQuota();
        if (quota) {
            usage = {
                used: parseInt(quota.usage || '0'),
                limit: parseInt(quota.limit || '0'),
                usageInDrive: parseInt(quota.usageInDrive || '0'),
                usageInDriveTrash: parseInt(quota.usageInDriveTrash || '0')
            };
        }
    } catch (e) {
        console.error("Failed to fetch storage quota", e);
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

    return (
        <GlassCard>
            <h3>Storage</h3>
            <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Used</span>
                    <span>{formatBytes(usage.used)} / {formatBytes(usage.limit)}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        background: percentage > 90 ? '#ff4444' : 'var(--accent)',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                    {percentage.toFixed(1)}% of your storage used.
                </p>
            </div>
        </GlassCard>
    );
}
