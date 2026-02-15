'use server';

import { getDriveClient, getOrCreateFolder } from '@/lib/drive';
import { auth } from '@/auth';

const ATTENDANCE_FILE_NAME = 'attendance.json';

type AttendanceRecord = {
    date: string; // YYYY-MM-DD
    classId: string;
    presentStudentIds: string[];
};

// --- HELPER: Get File ID by Name ---
async function getFileIdByName(drive: any, folderId: string, fileName: string) {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
        fields: 'files(id)',
    });
    return res.data.files?.[0]?.id || null;
}

// --- HELPER: Read JSON from Drive ---
async function readJsonFromDrive<T>(drive: any, fileId: string): Promise<T[]> {
    try {
        const response = await drive.files.get({ fileId, alt: 'media' });
        const content = response.data;
        return typeof content === 'string' ? JSON.parse(content) : (content || []);
    } catch (e) {
        console.error(`Error reading file ${fileId}:`, e);
        return [];
    }
}

// --- HELPER: Write JSON to Drive ---
async function writeJsonToDrive(drive: any, folderId: string, fileName: string, fileId: string | null, data: any) {
    const media = {
        mimeType: 'application/json',
        body: JSON.stringify(data, null, 2)
    };

    if (fileId) {
        await drive.files.update({ fileId, media });
    } else {
        await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
                mimeType: 'application/json'
            },
            media
        });
    }
}

export async function getAttendanceAction(date: string, classId: string) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, ATTENDANCE_FILE_NAME);
        if (!fileId) return { presentStudentIds: [] };

        const allRecords = await readJsonFromDrive<AttendanceRecord>(drive, fileId);
        const record = allRecords.find(r => r.date === date && r.classId === classId);

        return { presentStudentIds: record ? record.presentStudentIds : [] };

    } catch (error: any) {
        console.error("Get Attendance Error:", error);
        return { error: 'Failed to fetch attendance' };
    }
}

export async function saveAttendanceAction(date: string, classId: string, presentStudentIds: string[]) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, ATTENDANCE_FILE_NAME);
        const allRecords = fileId ? await readJsonFromDrive<AttendanceRecord>(drive, fileId) : [];

        // Remove existing record for this date/class if exists
        const otherRecords = allRecords.filter(r => !(r.date === date && r.classId === classId));

        // Add new record
        const newRecord: AttendanceRecord = { date, classId, presentStudentIds };
        const updatedRecords = [...otherRecords, newRecord];

        await writeJsonToDrive(drive, folderId, ATTENDANCE_FILE_NAME, fileId, updatedRecords);

        return { success: true };

    } catch (error: any) {
        console.error("Save Attendance Error:", error);
        return { error: 'Failed to save attendance' };
    }
}
