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
