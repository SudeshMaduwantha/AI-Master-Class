import { auth } from "@/auth";
import { deleteFile, getOrCreateFolder, renameFile } from "@/lib/drive";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action, fileId, name } = body;

        switch (action) {
            case "delete":
                if (!fileId) return NextResponse.json({ error: "File ID required" }, { status: 400 });
                await deleteFile(fileId);
                return NextResponse.json({ success: true });

            case "rename":
                if (!fileId || !name) return NextResponse.json({ error: "File ID and Name required" }, { status: 400 });
                const renamedFile = await renameFile(fileId, name);
                return NextResponse.json({ success: true, file: renamedFile });

            case "createFolder":
                if (!name) return NextResponse.json({ error: "Folder Name required" }, { status: 400 });
                const folderId = await getOrCreateFolder(name);
                return NextResponse.json({ success: true, folderId });

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
