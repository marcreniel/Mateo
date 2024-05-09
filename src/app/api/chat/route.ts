import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'

import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Tool, StructuredTool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";

import { LangChainStream } from '@/utils/langchain/langChainStream';
import { SummarySearchEmails } from '@/utils/tools/summarySearchEmails';
import { SpecificEmailSearch } from '@/utils/tools/specificEmailSearch';
import { SendNewEmail } from '@/utils/tools/sendNewEmail';
import { DraftTool } from '@/utils/tools/draftTool';

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

/*
 * This is an agent that initializes the OpenAI GPT-3.5-turbo model,
 * as well as tools, and output parser.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body.messages ?? []
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
    const currentMessageContent = messages[messages.length - 1].content

    // Define the tools
    const tools: (StructuredTool[] | Tool[]) = [
      new SummarySearchEmails(currentMessageContent), 
      new SpecificEmailSearch(currentMessageContent),
      new DraftTool(),
      new SendNewEmail(currentMessageContent),
    ];

    // Prompt to make the agent execute functions 
    const prompt = await pull<ChatPromptTemplate>(
      "hwchase17/openai-functions-agent"
    );
    
    // Initialize the ChatOpenAI model
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_KEY,
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