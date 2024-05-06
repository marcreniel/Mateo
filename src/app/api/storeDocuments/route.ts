// Work In Progress
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

import { createClient } from "@supabase/supabase-js";

import { NextRequest, NextResponse } from 'next/server';

import { google } from 'googleapis';
import { readUserSession, getUserToken, refreshGoogleToken } from '@/utils/actions';

import crypto from 'crypto';

// Create a new Gmail client
const gmail = google.gmail({ version: 'v1' });

// Base64 decoding function
function decodeBase64(data: string) {
    // For Node.js environment:
    return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  }
  
// Implemented try catch for error handling
export async function GET(request: NextRequest) {
    try {
        // Get the private key and url from env, throw error if not present
        const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) throw new Error(`Expected env var SUPABASE_URL`);

        // Get the user session
        const { data:session } = await readUserSession();
            
        // Create a new client with the private key and url to prepare VectorStore
        const client = createClient(url, privateKey);

        // Initialize VectorStore with the OpenAIEmbeddings and client
        const vectorStore = new SupabaseVectorStore(
            new OpenAIEmbeddings({ apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY }),        
            {
            client,
            tableName: "documents",
            queryName: "match_documents",
            });

        // If the user is logged in
        if (session.session) {
            // Get the user's token from db
            const token = await getUserToken();
            
            // Create an OAuth2 client, append token
            const auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
            );
            auth.setCredentials({ access_token: token});
            google.options({ auth });

            // Test auth with ping, if not send refresh token call to get new token
            try {
                const ping = await gmail.users.getProfile({ userId: 'me' });
            } catch (err) {
                // If the token is expired, refresh it using util function
                const tryRefresh = await refreshGoogleToken();
                if(tryRefresh){
                    // Get the refreshed token from db and set it to the OAuth2 client
                    const token = await getUserToken();
                    auth.setCredentials({ access_token: token });
                    google.options({ auth });
                } else {
                    // If the refresh token fails, return an error
                    return NextResponse.json({ error: "Refreshing token produced err" }, { status: 500 });
                }
            } 

            try {
                // Fetch the user's emails
                const listResponse = await gmail.users.messages.list({
                userId: 'me',
                maxResults: 20,
                });

                // If there are no emails, return an error
                if (!listResponse.data.messages) {
                    return NextResponse.json({ error: "no emails found" }, { status: 401 });
                }

                // Map over each email and extract the necessary data
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

                    // Extract the email content
                    const part = msgResponse.data.payload?.parts?.find(part => part.mimeType === 'text/plain');
                    if (part && part.body?.data) {
                        emailData.content = decodeBase64(part.body.data);
                    }
                    return emailData;
                    })
                );
            
            // Map over each email and store it in the vector store, if the email is too large skip it
            emailDetails.forEach(async (email) => {
                try {
                    // Create a hash of the email content to prevent duplicates and make vectors more unique
                    // Also user ID to store in the vector store to query later
                    const hash = crypto.createHash('sha256').update(`${email.content}${session.session.user.id}`).digest('hex');
                    const document = {pageContent: `Subject: ${email.subject}, From: ${email.from}, Snippet: ${email.snippet}, Content: ${email.content}`,
                                    metadata: {udid: session.session.user.id, hash: hash}};
                
                    const searchResult = await vectorStore.similaritySearch(
                        `Subject: ${email.subject}, From: ${email.from}, Snippet: ${email.snippet}, Content: ${email.content}`,
                        1,
                        { udid: session.session.user.id, hash: hash });

                    if (searchResult.length > 0) {
                        console.log("Document already exists in the vector store:");
                        } else {
                        console.log("Document does not exist in the vector store, adding to the vector store:");
                        await vectorStore.addDocuments([document]);
                        }
                } catch (err) {
                    // If the email is too long, skip it, log an error (WIP: break up large emails into smaller chunks)
                    console.error("Embedding too long, skipping document.");
                }
            });

            } catch (err) {
                // If there is an error fetching the emails or storing a vector, return an error
                return NextResponse.json({ error: "error fetching emails and storing in vector" }, { status: 500 });
            }
    
            // If the emails are fetched and stored in the vector, return a success message
            return NextResponse.json({ status: "stored to vector" }, { status: 200 });

        } else {
            // If the user is not logged in, return an error
            return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
        }
    }
    catch (error) {
        // Generic error handling, return an error
        return NextResponse.json({ error: error }, { status: 500 });
    }
}