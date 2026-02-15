import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive';
import { auth } from '@/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        // NOTE: Ideally, you would check for a "Student" role or similar here.
        // For now, we require at least a valid session to prevent public scraping,
        // OR you could make this public if you want truly public links.
        // Let's require auth for now to check session invalidation issues.
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params; // Await params in Next.js 15+

        const drive = await getDriveClient();

        // Get file content
        const response = await drive.files.get({
            fileId: id,
            alt: 'media',
        });

        // Ensure it's a JSON file (basic check)
        if (typeof response.data === 'object') {
            return NextResponse.json(response.data);
        } else {
            return NextResponse.json(JSON.parse(response.data as string));
        }

    } catch (error: any) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
    }
}
