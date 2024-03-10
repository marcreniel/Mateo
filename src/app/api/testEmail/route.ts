import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const gmail = google.gmail({ version: 'v1' });

// Base64 decoding function
function decodeBase64(data: string) {
    // For Node.js environment:
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  }
  
export async function GET(request: NextRequest) {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    auth.setCredentials({ access_token: "ya29.a0Ad52N39Yr7E0nitcrR59QJbAkLaM7DyF0vSHlmqlzFwQc_9RX7NtYP4M_eCI7PiKqiIbY61ChOMJm4dOvvlnIkhkAdYfqrRh0PAV2Yx1t3yWeJWY4OubZQ3F3TYi0O-0QDyBVCmy3-H65psQ5nuGLs3sp2gmf8RC3hyZaCgYKAbYSARESFQHGX2MimJvWrB1XZiyHdHQ4ODoQag0171" });

    google.options({ auth });

    const today = new Date().toISOString().split('T')[0];
    const query = `after:${today}`;

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
    });

    if (!listResponse.data.messages) {
      return NextResponse.json({ emails: [] }, { status: 200 });
    }

    const emailDetails = await Promise.all(
      listResponse.data.messages
        .filter((message) => typeof message.id === 'string') // Filter out any messages that don't have an 'id' as a string
        .map(async (message) => {
          const id = message.id as string; // TypeScript type assertion, we've already filtered nulls/undefined
          const msgResponse = await gmail.users.messages.get({
            userId: 'me',
            id: id,
            format: 'full',
          });

          // Construct email data
          const emailData: any = {
            snippet: msgResponse.data.snippet,
          };

          // Extract headers like 'Subject' and 'From'
        msgResponse.data.payload?.headers?.forEach((header) => {
            if (header.name === 'Subject') {
                emailData.subject = header.value;
            } else if (header.name === 'From') {
                emailData.from = header.value;
            }
        });

        const part = msgResponse.data.payload?.parts?.find(part => part.mimeType === 'text/plain');
        if (part && part.body?.data) {
            emailData.content = decodeBase64(part.body.data);
        }
          return emailData;
        })
    );

    console.log(emailDetails)

    return NextResponse.json({ emails: emailDetails }, { status: 200 });
  } catch (err) {
    console.error('Error reading emails:', err);
    return NextResponse.json({ error: 'Failed to read emails' }, { status: 500 });
  }
}