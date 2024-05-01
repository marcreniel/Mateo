import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readUserSession, getUserToken, refreshGoogleToken } from '@/utils/actions';

const gmail = google.gmail({ version: 'v1' });

// Base64 decoding function
function decodeBase64(data: string) {
    // For Node.js environment:
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  }
  
export async function GET(request: NextRequest) {
    const { data:session } = await readUserSession();
    console.log(session.session)

    if (session.session) {
        try {
        // Get the user's token from db
        const token = await getUserToken();
        
        // Create an OAuth2 client, append token
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );
        auth.setCredentials({ access_token: token});

        // Try authenticating, if not send refresh token call to get new token
        try {
            google.options({ auth });
        } catch (err) {
            if ("test") {
                const tryRefresh = await refreshGoogleToken();
                if(tryRefresh){
                    const token = await getUserToken();
                    auth.setCredentials({ access_token: token });
                    google.options({ auth });
                } else {
                    return NextResponse.json({ error: "Refreshing token produced err" }, { status: 500 });
                }
            }
            else {
                return NextResponse.json({ error: "Refresh token/token invalid" }, { status: 500 });    
            }
        }   

        const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        });
        
        if (!listResponse.data.messages) {
        return NextResponse.json({ error: "no emails found" }, { status: 401 });
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
        return NextResponse.json({ emails: emailDetails }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to read emails' }, { status: 500 });
        
    }
    } else {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
}