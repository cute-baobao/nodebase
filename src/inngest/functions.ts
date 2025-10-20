import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  {
    id: 'hello-world',
  },
  {
    event: 'test/hello.world',
  },
  async ({ event, step }) => {
    await step.sleep('waiting 1 second', 1000);
    return { message: `Hello, ${event.data.email}` };
  },
);

export const ai = inngest.createFunction(
  {
    id: 'execute-ai',
  },
  { event: 'execute/ai' },
  async ({ event, step }) => {
    await step.sleep('simulating AI processing', 2000);
    const { steps } = await step.ai.wrap('gemini ai gogogo', generateText, {
      model: google('gemini-2.5-flash'),
      prompt: 'say gogogo',
    });
    return { steps };
  },
);
