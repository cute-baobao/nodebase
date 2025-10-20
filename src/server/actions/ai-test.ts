'use server';
import { inngest } from '@/inngest/client';

export const test = async () => {
  await inngest.send({
    name: 'execute/ai',
  });
  return { success: true, message: 'Job Success' };
};
