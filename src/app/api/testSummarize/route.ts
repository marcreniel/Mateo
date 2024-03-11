import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY,
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encodedEmail = searchParams.get('email');

  if (!encodedEmail) {
    return NextResponse.json({ error: 'No email provided' }, { status: 400 });
  }

  const decodedEmail = decodeURIComponent(encodedEmail);
  const jsonEmail = JSON.parse(decodedEmail);

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
    model: 'gpt-3.5-turbo',
  });

  return NextResponse.json({ data: chatCompletion.choices[0].message.content }, { status: 200 });
}