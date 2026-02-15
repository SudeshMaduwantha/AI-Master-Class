'use server';

import { model } from '@/lib/gemini';
import * as cheerio from 'cheerio';
import { getDriveClient, getOrCreateFolder } from '@/lib/drive';
import { auth } from '@/auth';

export async function generateQuizAction(input: string, type: 'text' | 'url' | 'pdf' = 'text', numQuestions: number = 5) {
    // ... (Existing generateQuizAction code remains unchanged) ...
    console.log(`[QuizGen] Starting generation. Type: ${type}, Questions: ${numQuestions}`);

    try {
        let parts: any[] = [];

        // Base Prompt
        const systemPrompt = `
            You are an expert teacher. Create a quiz based on the provided content.
            Generate ${numQuestions} Multiple Choice Questions (MCQs) and 1 Short Answer question.
            
            Return the output strictly in the following JSON format (no markdown code blocks):
            {
                "questions": [
                    {
                        "type": "mcq",
                        "question": "Question text here",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "answer": "Correct Option Text"
                    },
                    ... (Total ${numQuestions} MCQs)
                    {
                        "type": "short",
                        "question": "Question text here",
                        "answer": "Model answer here"
                    }
                ]
            }
        `;

        parts.push({ text: systemPrompt });

        // 1. Handle URL Input
        if (type === 'url') {
            try {
                console.log(`[QuizGen] Fetching URL: ${input}`);
                const response = await fetch(input);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                const $ = cheerio.load(html);
                const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 20000);
                console.log(`[QuizGen] URL fetched. Length: ${textContent.length}`);
                parts.push({ text: `Content from URL:\n${textContent}` });
            } catch (err: any) {
                console.error("[QuizGen] URL Error:", err);
                return { error: `Failed to fetch URL: ${err.message}` };
            }
        }

        // 2. Handle Text Input (includes client-extracted PDF text)
        else {
            if (!input || input.length < 50) {
                return { error: 'Content is too short to generate a quiz. Please provide more detail.' };
            }
            // Sanitize text
            const textContent = input.replace(/[\x00-\x1F\x7F-\x9F]/g, "").replace(/\s+/g, " ").trim();
            parts.push({ text: `Text Content:\n${textContent}` });
        }

        console.log("[QuizGen] Sending request to Gemini...");
        const result = await model.generateContent(parts);
        const response = await result.response;
        const textResponse = response.text();
        console.log("[QuizGen] Received response.");

        // Clean up markdown code blocks
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error:", textResponse);
            return { error: 'AI failed to format the quiz correctly. Please try again.' };
        }

    } catch (error: any) {
        console.error('Quiz Generation Error Full:', error);
        return { error: `Quiz Generation Failed: ${error.message || 'Unknown error'}` };
    }
}

export async function saveQuizToDrive(quizData: any, title: string) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();

        // 1. Get or Create "MasterClass Quizzes" Folder
        const folderId = await getOrCreateFolder('MasterClass Quizzes');
        if (!folderId) return { error: 'Failed to access quiz folder' };

        // 2. Create File Metadata
        const fileMetadata = {
            name: `${title}.json`,
            parents: [folderId],
            mimeType: 'application/json',
            appProperties: {
                type: 'masterclass_quiz', // Flag to identify our files
                generatedBy: 'AI Tutor'
            }
        };

        // 3. Create Media (JSON Content)
        const media = {
            mimeType: 'application/json',
            body: JSON.stringify(quizData, null, 2)
        };

        // 4. Upload to Drive
        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink'
        });

        console.log("[QuizGen] Quiz saved to Drive:", file.data.id);
        return { success: true, fileId: file.data.id, link: file.data.webViewLink };

    } catch (error: any) {
        console.error("Save Quiz Error:", error);
        return { error: `Failed to save quiz: ${error.message}` };
    }
}

export async function chatTutorAction(history: { role: string, parts: { text: string }[] }[], message: string, context: string) {
    console.log("[AI Tutor] Action called.");
    console.log("[AI Tutor] Message:", message);
    console.log("[AI Tutor] Context Length:", context?.length || 0);
    console.log("[AI Tutor] History Length:", history?.length || 0);

    try {
        const session = await auth();
        if (!session) {
            console.error("[AI Tutor] Unauthorized access attempt.");
            return { error: 'Unauthorized' };
        }

        const systemPrompt = `
            You are an expert AI Tutor for a MasterClass environment. 
            Your goal is to help students understand the provided study material.
            
            CONTEXT:
            ${context ? context.slice(0, 20000) : "No specific context provided."}

            INSTRUCTIONS:
            - Answer questions based STRICTLY on the provided context if possible.
            - If the answer is not in the context, you may use general knowledge but mention that it's outside the provided notes.
            - Be concise, encouraging, and clear.
            - Use formatting (bullet points, bold text) to make answers readable.
        `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to help you with this material. What would you like to know?" }]
                },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        console.log("[AI Tutor] Sending message to Gemini...");
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();
        console.log("[AI Tutor] Response received. Length:", text.length);

        return {
            success: true,
            message: text
        };

    } catch (error: any) {
        console.error("Chat Tutor Error:", error);
        return { error: `Failed to get answer: ${error.message}` };
    }
}

export async function getSavedQuizzesAction() {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Quizzes');

        if (!folderId) return { quizzes: [] };

        const res = await drive.files.list({
            q: `'${folderId}' in parents and appProperties has { key='type' and value='masterclass_quiz' } and trashed = false`,
            fields: 'files(id, name, createdTime, webViewLink)',
            orderBy: 'createdTime desc'
        });

        return { quizzes: res.data.files || [] };

    } catch (error: any) {
        console.error("Get Saved Quizzes Error:", error);
        return { error: `Failed to fetch quizzes: ${error.message}` };
    }
}

export async function loadQuizAction(fileId: string) {
    try {
        const session = await auth();
        if (!session) return { error: 'Unauthorized' };

        const drive = await getDriveClient();

        const response = await drive.files.get({
            fileId,
            alt: 'media'
        });

        // The response.data might be a string (if axios transforms it) or an object
        // googleapis usually returns the object directly if it's JSON
        const quizData = typeof response.data === 'string'
            ? JSON.parse(response.data)
            : response.data;

        return { success: true, quiz: quizData };

    } catch (error: any) {
        console.error("Load Quiz Error:", error);
        return { error: `Failed to load quiz: ${error.message}` };
    }
}

// --- Quiz Results Logic ---

export async function saveQuizResultAction(quizId: string, studentName: string, score: number, answers: any) {
    try {
        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { error: 'Failed to access data folder' };

        const RESULTS_FILE_NAME = 'quiz_results.json';

        // Find existing file
        let fileId = null;
        try {
            const res = await drive.files.list({
                q: `'${folderId}' in parents and name = '${RESULTS_FILE_NAME}' and trashed = false`,
                fields: 'files(id)',
            });
            if (res.data.files && res.data.files.length > 0) {
                fileId = res.data.files[0].id;
            }
        } catch (e) { console.error("Error finding results file:", e); }

        let results: any[] = [];

        if (fileId) {
            try {
                const response = await drive.files.get({ fileId, alt: 'media' });
                // Handle axios/googleapis return type differences
                results = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            } catch (e) {
                console.warn("Could not read existing results, starting fresh.");
                results = [];
            }
        }

        const newResult = {
            id: Date.now().toString(),
            quizId,
            studentName: studentName || 'Anonymous',
            score,
            answers,
            timestamp: new Date().toISOString()
        };

        results.push(newResult);

        // Save back
        if (fileId) {
            await drive.files.update({
                fileId,
                media: { mimeType: 'application/json', body: JSON.stringify(results, null, 2) }
            });
        } else {
            await drive.files.create({
                requestBody: {
                    name: RESULTS_FILE_NAME,
                    parents: [folderId],
                    mimeType: 'application/json'
                },
                media: { mimeType: 'application/json', body: JSON.stringify(results, null, 2) }
            });
        }

        return { success: true };

    } catch (error: any) {
        console.error("Save Quiz Result Error:", error);
        return { error: `Failed to save result: ${error.message}` };
    }
}

export async function getQuizResultsAction(quizId?: string) {
    try {
        const drive = await getDriveClient();
        const folderId = await getOrCreateFolder('MasterClass Data');
        if (!folderId) return { results: [] };

        const RESULTS_FILE_NAME = 'quiz_results.json';

        let fileId = null;
        const res = await drive.files.list({
            q: `'${folderId}' in parents and name = '${RESULTS_FILE_NAME}' and trashed = false`,
            fields: 'files(id)',
        });
        if (res.data.files && res.data.files.length > 0) {
            fileId = res.data.files[0].id;
        }

        if (!fileId) return { results: [] };

        const response = await drive.files.get({ fileId, alt: 'media' });
        const allResults = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        if (quizId) {
            return { results: allResults.filter((r: any) => r.quizId === quizId) };
        }

        return { results: allResults };

    } catch (error: any) {
        console.error("Get Quiz Results Error:", error);
        return { error: `Failed to fetch results: ${error.message}` };
    }
}
