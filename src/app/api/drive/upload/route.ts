import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getOrCreateFolder } from '@/lib/drive';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const drive = await getDriveClient();
        const folderIdParam = formData.get('folderId') as string;

        let folderId;
        if (folderIdParam) {
            folderId = folderIdParam;
        } else {
            // Default to "Class Recordings" folder if no specific folder is provided
            folderId = await getOrCreateFolder('Class Recordings');
        }

        // Convert Web Stream to Node Stream
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(fileBuffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                mimeType: file.type,
                parents: [folderId!],
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: 'id, name, webViewLink',
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
