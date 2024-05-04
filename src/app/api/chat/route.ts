import { NextRequest } from 'next/server'
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'

import { ChatOpenAI } from "@langchain/openai";
import { BytesOutputParser } from '@langchain/core/output_parsers'

import { LangChainStream } from '@/utils/steam/langChainStream';

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { Calculator } from "@langchain/community/tools/calculator";
import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

import { Tool } from "@langchain/core/tools";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

/*
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const messages = body.messages ?? []
  // WIP 
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content
  
  // Define the tools (WIP Example, tools just to debug agent streaming)
  const tools: Tool[] = [new TavilySearchResults({
    apiKey: "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"
  }), new Calculator()];

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

  const outputParser = new BytesOutputParser()

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const logStream = await agentExecutor.streamLog({
    input: currentMessageContent
  });
  
  const encoder = new TextEncoder();
  
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

  const parsedStream = LangChainStream(customReadable, {
    onCompletion: async (completion: string) => {
      console.log('COMPLETE!', completion)
    }
})

  return new StreamingTextResponse(parsedStream)
}