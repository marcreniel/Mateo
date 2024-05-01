import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { EmailSummary } from '@/utils/templates/summaryTemplate';
import { readUserSession } from '@/utils/actions';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY);

export async function POST(request: NextRequest) {
    const readable = await request.text();

    if (!readable) {
        return NextResponse.json({ error: 'No email content' }, { status: 400 });
    }

    const jsonArray = JSON.parse(readable);

    const { data:session } = await readUserSession();

    if (!session) {
        return NextResponse.json({ error: 'No user session' }, { status: 401 });
    }

    const email = session.session?.user.email;

    const { data, error } = await resend.emails.send({
        from: 'Mateo <onboarding@resend.dev>',
        to: [``],
        subject: 'Hello world',
        react: EmailSummary(jsonArray),
      });
    
      if (error) {
        return NextResponse.json({ error: error }, { status: 500 });
      }
    
    return NextResponse.json({ data: "Sent" }, { status: 200 });
}