// Deprecated: This API route will no longer be used in the app, but will be used as a debug tool for querying documents from the vector store.

import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

import { NextRequest, NextResponse } from 'next/server';
import { readUserSession } from '@/utils/actions';
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    console.log("here")
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

        if (session.session) {
            const result = await vectorStore.similaritySearch(``, 20, {
                udid: session.session.user.id,
            })
            
            if (!result) {
                return NextResponse.json({ error: "no documents found" }, { status: 401 });
            } else {
                const parseDate = (dateStr: string) => {
                    return new Date(dateStr).getTime(); // Convert the date to a number using getTime()
                };

                // Sorting function
                await result.sort((a, b) => {
                    return parseDate(b.metadata.date) - parseDate(a.metadata.date);
                });
            }
            return NextResponse.json(result, { status: 200 });
        }
    } catch (error) {
        // Generic error handling
        return NextResponse.json({ error: error }, { status: 500 });
    }
}