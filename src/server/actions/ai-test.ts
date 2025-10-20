'use server';
import { inngest } from '@/inngest/client';

export const test = async () => {
  await inngest.setEventKey("execute/ai")
};
