import { NextRequest, NextResponse } from 'next/server';

import { Resend } from 'resend';

import { EmailSummary } from '@/utils/templates/summaryTemplate';
import { readUserSession } from '@/utils/actions';

// Create a new Resend instance for composing and sending emails
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_KEY);

export async function POST(request: NextRequest) {
  try {
    // Get the request body from the API call, if there is nothing return an error
    const readable = await request.text();

    if (!readable) {
        // If there is no request body, return an error
        return NextResponse.json({ error: 'No email content' }, { status: 400 });
    }

    // Parse the JSON data from the request body
    const jsonArray = JSON.parse(readable);

    // Get the user session 
    const { data:session } = await readUserSession();

    if (!session) {
        // If there is no user session, return an error
        return NextResponse.json({ error: 'No user session' }, { status: 401 });
    }

    // Extract the email from the user session
    const email = session.session?.user.email;

    // Send the email using the Resend API
    const { data, error } = await resend.emails.send({
        from: 'Mateo <onboarding@resend.dev>',
        to: [`marcbernardino2005@gmail.com`], // Replace with email (WIP)
        subject: 'Your daily inbox summary 🚀',
        react: EmailSummary(jsonArray),
      });
    
      if (error) {
        // If there is an error, sending email return the error message
        return NextResponse.json({ error: error }, { status: 500 });
      }
    
    // Return the response from the Resend API
    return NextResponse.json({ status: "sent", data: data }, { status: 200 });
  } catch (error) {
    // Generic error handling
    return NextResponse.json({ error: error }, { status: 500 });
  }
}