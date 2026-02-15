import { google } from 'googleapis';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export async function getDriveClient() {
    const session = await auth();

    // Check if session exists, has access token, and no auth errors
    if (!session || !session.accessToken || (session as any).error) {
        console.warn("Authentication failed or token expired. Redirecting to login.");
        redirect('/login');
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: session.accessToken as string });

    return google.drive({ version: 'v3', auth: authClient });
}

export async function listFiles(folderId?: string) {
    try {
        const drive = await getDriveClient();
        const response = await drive.files.list({
            q: `'${folderId || 'root'}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink)',
            orderBy: 'createdTime desc',
            pageSize: 20,
        });
        return response.data.files || [];
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) {
            console.error('Unauthorized access (401). Redirecting to login.');
            redirect('/login');
        }
        console.error('Error listing files:', error);
        throw error;
    }
}

export async function getOrCreateFolder(folderName: string) {
    try {
        const drive = await getDriveClient();
        // Check if folder exists
        const listResponse = await drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`,
            fields: 'files(id, name)',
        });

        if (listResponse.data.files && listResponse.data.files.length > 0) {
            return listResponse.data.files[0].id;
        }

        // Create folder
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        const createResponse = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        });
        return createResponse.data.id;
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error creating folder:', error);
        throw error;
    }
}

export async function deleteFile(fileId: string) {
    try {
        const drive = await getDriveClient();
        await drive.files.delete({
            fileId: fileId,
        });
        return { success: true };
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function renameFile(fileId: string, newName: string) {
    try {
        const drive = await getDriveClient();
        const response = await drive.files.update({
            fileId: fileId,
            requestBody: {
                name: newName,
            },
            fields: 'id, name',
        });
        return response.data;
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error renaming file:', error);
        throw error;
    }
}

export async function getStorageQuota() {
    try {
        const drive = await getDriveClient();
        const response = await drive.about.get({
            fields: 'storageQuota',
        });
        return response.data.storageQuota;
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error fetching storage quota:', error);
        // Return dummy data or throw based on preference, but redirect happens above
        throw error;
    }
}

export async function searchFiles(query: string) {
    try {
        const drive = await getDriveClient();
        const response = await drive.files.list({
            q: `name contains '${query}' and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, thumbnailLink)',
            orderBy: 'createdTime desc',
            pageSize: 20,
        });
        return response.data.files || [];
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error searching files:', error);
        throw error;
    }
}

export async function getFolder(folderId: string) {
    try {
        const drive = await getDriveClient();
        const response = await drive.files.get({
            fileId: folderId,
            fields: 'id, name',
        });
        return response.data;
    } catch (error: any) {
        if (error.code === 401 || error?.response?.status === 401) redirect('/login');
        console.error('Error fetching folder:', error);
        return null;
    }
}
