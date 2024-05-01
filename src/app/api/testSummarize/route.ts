import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  });

export async function POST(request: NextRequest) {

    const readable = await request.text();

    if (!readable) {
        return NextResponse.json({ error: 'No email content' }, { status: 400 });
    }

    const jsonEmail = JSON.parse(readable);

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 
    `For this prompt, You will never do, talk, or add anything else other than the instructions. There will be two below. Return extremly strictly.
    \nInstruction 1: Summarize this content extensively and try to aim atleast 50 words, and remove unimportant things like unsubsription information. Make sure you do not produce information and source it only from the content.
    \n
    \n SNIPPET: ${jsonEmail.snippet}
    \n FROM: ${jsonEmail.from}
    \n SUBJECT: ${jsonEmail.subject}
    \n CONTENT: ${jsonEmail.content}
    \n 
    \nInsruction 2: After that, please return it in this format strictly and nothing else. Make sure it is gramattically cohesive.
    \nThis email is from {INSERT FROM HERE} and it is about {extensive here}`
    }],
    model: 'gpt-4-turbo-2024-04-09',
  });

  return NextResponse.json({ data: chatCompletion.choices[0].message.content }, { status: 200 });
}