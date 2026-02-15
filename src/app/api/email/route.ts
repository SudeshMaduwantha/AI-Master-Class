import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { to, subject, text, link } = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // User needs to set this
                pass: process.env.EMAIL_PASS, // User needs to set this
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: subject || 'New Class Recording',
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Recording Available</h2>
          <p>${text}</p>
          <a href="${link}" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Watch Recording</a>
          <p style="margin-top: 20px; font-size: 0.8em; color: #666;">Sent via Drive Sync App</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
