'use server';

import { getDriveClient, getOrCreateFolder } from '@/lib/drive';
import { auth } from '@/auth';

export type ClassItem = {
    id: string;
    name: string;
    fee: number;
};

export type Student = {
    id: string;
    name: string;
    email: string;
    classId: string;
    className: string;
    fee: number;
    discount: number;
    finalFee: number;
    status: 'Paid' | 'Pending';
    joinedAt: string;
};

const STUDENTS_FILE_NAME = 'students.json';
const CLASSES_FILE_NAME = 'classes.json';

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

// =======================
// CLASS ACTIONS
// =======================

export async function getClassesAction() {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, CLASSES_FILE_NAME);
        if (!fileId) return { classes: [] };

        const classes = await readJsonFromDrive<ClassItem>(drive, fileId);
        return { classes };

    } catch (error: any) {
        console.error("Get Classes Error:", error);
        return { error: 'Failed to fetch classes' };
    }
}

export async function addClassAction(name: string, fee: number) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, CLASSES_FILE_NAME);
        const currentClasses = fileId ? await readJsonFromDrive<ClassItem>(drive, fileId) : [];

        const newClass: ClassItem = {
            id: crypto.randomUUID(),
            name,
            fee
        };

        await writeJsonToDrive(drive, folderId, CLASSES_FILE_NAME, fileId, [...currentClasses, newClass]);

        return { success: true, newClass };

    } catch (error: any) {
        console.error("Add Class Error:", error);
        return { error: 'Failed to add class' };
    }
}

// =======================
// STUDENT ACTIONS
// =======================

export async function getStudentsAction() {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, STUDENTS_FILE_NAME);
        if (!fileId) return { students: [] };

        const students = await readJsonFromDrive<Student>(drive, fileId);
        return { students };

    } catch (error: any) {
        console.error("Get Students Error:", error);
        return { error: 'Failed to fetch students' };
    }
}

export async function addStudentAction(studentData: {
    name: string;
    email: string;
    classId: string;
    className: string;
    fee: number;
    discount: number;
    status: 'Paid' | 'Pending';
}) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, STUDENTS_FILE_NAME);
        const currentStudents = fileId ? await readJsonFromDrive<Student>(drive, fileId) : [];

        const finalFee = Math.max(0, studentData.fee - studentData.discount);

        const newStudent: Student = {
            id: crypto.randomUUID(),
            ...studentData,
            finalFee,
            joinedAt: new Date().toISOString()
        };

        await writeJsonToDrive(drive, folderId, STUDENTS_FILE_NAME, fileId, [...currentStudents, newStudent]);

        return { success: true, student: newStudent };

    } catch (error: any) {
        console.error("Add Student Error:", error);
        return { error: 'Failed to add student' };
    }
}

export async function deleteStudentAction(studentId: string) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const fileId = await getFileIdByName(drive, folderId, STUDENTS_FILE_NAME);
        if (!fileId) return { error: 'Student records not found' };

        const currentStudents = await readJsonFromDrive<Student>(drive, fileId);
        const updatedStudents = currentStudents.filter(s => s.id !== studentId);

        await writeJsonToDrive(drive, folderId, STUDENTS_FILE_NAME, fileId, updatedStudents);

        return { success: true };

    } catch (error: any) {
        console.error("Delete Student Error:", error);
        return { error: 'Failed to delete student' };
    }
}
