import { db } from '@/db';
import { checkout, polar, portal } from '@polar-sh/better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { github } from 'better-auth/social-providers';
import { polarClient } from './polar';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: '5b4cd2f8-36da-4d20-8634-743542b38800',
              slug: 'pro',
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL!,
        }),
        portal(),
      ],
    }),
  ],
});
