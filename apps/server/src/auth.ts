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
		crossSubDomainCookies: {
			enabled: true,
			domain: process.env.NODE_ENV === "production" ? "context-ed.app" : undefined,
		},
		defaultCookieAttributes: {
			secure: true,
			sameSite: "lax",
			httpOnly: true,
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN!],
});