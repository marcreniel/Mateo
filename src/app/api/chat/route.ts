import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'

import { LangChainStream } from '@/utils/langchain/tools/langChainStream';

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicTool } from "@langchain/core/tools";

import { Tool } from "@langchain/core/tools";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createClient } from "@supabase/supabase-js";
import { readUserSession } from '@/utils/actions';

import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough} from "@langchain/core/runnables";
import { RunnableSequence } from "@langchain/core/runnables";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
function formatMessage(message: VercelChatMessage) {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    // Handle other roles or invalid roles if necessary
    return null;
  }
}

// Fetch emails from the user's inbox (WIP, just a very rough implementation)
async function fetchEmails(query: string) {
  try {
    const { data:session } = await readUserSession();

    const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error(`Expected env var SUPABASE_URL`);

    const client = createClient(url, privateKey);

    const vectorStore = new SupabaseVectorStore(
      new OpenAIEmbeddings({ apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY }),        
      {
      client,
      tableName: "documents",
      queryName: "match_documents",
      });
    
    const template = `Answer the question based only on the following context:
    {context}
    Question: {question}`;

    const prompt = ChatPromptTemplate.fromTemplate(template);

    const model = new ChatOpenAI({
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
      apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
    });

    const chain = RunnableSequence.from([
      {
        context: async (input) => {
          return JSON.stringify(
            await vectorStore.asRetriever(5, { udid: session.session?.user.id }).invoke(input)
          );
        },
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(query);

    return result;
    } catch (error) {
      return `Error: ${error}`;
    }
  }

/*
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body.messages ?? []
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
    const currentMessageContent = messages[messages.length - 1].content

    // Define the tools (WIP Example, tools just to debug agent streaming)
    const tools: Tool[] = [new TavilySearchResults({
      apiKey: "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"
    }), new Calculator(), 
    // WIP tool to search for emails (rough implementation, just for testing purposes)
    new DynamicTool({
      name: "SearchEmails",
      description:
        "Call this when you want to search for emails. Examples are when the user asks for emails or when the user asks something related to emails.",
      func: async () => await fetchEmails(currentMessageContent),
    }),
  ];

    // Prompt to make the agent execute functions 
    const prompt = await pull<ChatPromptTemplate>(
      "hwchase17/openai-functions-agent"
    );
    
    // Initialize the ChatOpenAI model
    const llm = new ChatOpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
      model: "gpt-3.5-turbo",
      temperature: 0,
      streaming: true,
    });

    // Initialize the agent
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
    });

    // Initialize the agent executor chain
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    // Invoke the streaming log function (workaround to stream output to the agent)
    const logStream = await agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages,
    });
    
    // Initialize the encoder to parse the logStream
    const encoder = new TextEncoder();
    
    // Create a custom readable stream to parse the logStream and filter the output 
    const customReadable = new ReadableStream({ 
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length
            ) {
              controller.enqueue(encoder.encode(addOp.value));
            }
          }
        }
        controller.close();
      },
    });

    // Create a new custom LangChainStream to parse the customReadable stream
    const parsedStream = LangChainStream(customReadable, {
      onCompletion: async (completion: string) => {
        console.log('COMPLETE!', completion)
      }
  })

    // Return the parsedStream as a StreamingTextResponse back to the client 
    return new StreamingTextResponse(parsedStream)
  } catch (error) {
    // Generic error handling, return an error
    return NextResponse.json({ error: error }, { status: 500 });
  }
}