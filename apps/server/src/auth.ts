import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@studyRAG/db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	
	socialProviders: {
		google: {
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!,
		},
	},
	advanced: {
		useSecureCookies: true,
		defaultCookieAttributes: {
			secure: true,
			sameSite: "none",
			httpOnly: true,
			domain: undefined
		},
		cookies: {
			session_token: {
				attributes: {
					sameSite: "none",
					secure: true,
				}
			},
			// The STATE cookie is what causes state_mismatch - must be explicitly configured
			state: {
				attributes: {
					sameSite: "none",
					secure: true,
				}
			}
		}
	},
	trustedOrigins: [process.env.CORS_ORIGIN!],
});