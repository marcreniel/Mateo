import { createClient } from "@supabase/supabase-js";
import { readUserSession } from '@/utils/actions';

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough} from "@langchain/core/runnables";
import { RunnableSequence } from "@langchain/core/runnables";
import { DynamicTool } from "@langchain/core/tools";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

// Query emails function from a user's inbox tuned for generalized summaries about an email
async function fetchEmails(query: string) {
    try {
      // Get the user session
      const { data:session } = await readUserSession();
  
      // Get the private key and url from env, throw error if not present
      const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) throw new Error(`Expected env var SUPABASE_URL`);
  
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
      
      // Template for the prompt to feed into LLM 
      const template = `Answer the question based only on the following context:
      {context}
      Question: {question}`;

      // Create a ChatPromptTemplate from the template
      const prompt = ChatPromptTemplate.fromTemplate(template);
  
      // Initialize the ChatOpenAI model
      const model = new ChatOpenAI({
        model: "gpt-3.5-turbo-0125",
        temperature: 0,
        apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
      });
  
      // Create a Langchain RunnableSequence, which invokes the vector store and score threshold retriever
      const chain = RunnableSequence.from([
        {
          context: async (input) => {
            //   await vectorStore.asRetriever(5, { udid: session.session?.user.id }).invoke(input)
            const retriever = await ScoreThresholdRetriever.fromVectorStore(vectorStore, {
                minSimilarityScore: 0.5,
                maxK: 8,
                kIncrement: 4,
                metadata: { udid: session.session?.user.id }
            }
            );
            return JSON.stringify(await retriever.invoke(input));
          },
          question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);
  
      // Invoke the chain with the query
      const result = await chain.invoke(query);
  
      return result;
      } catch (error) {
        return `Error: ${error}`;
      }
  }

// Class export for the tool
export class SummarySearchEmails extends DynamicTool {
    constructor(query: string) {
        super({
            name: "SummarySearchEmails",
            description:
                "Call this when the user asks for a summary of their ENTIRE inbox. This tool will fetch emails from the user's inbox and summarize them.",
            func: async () => await fetchEmails(query),
        });
    }
}
