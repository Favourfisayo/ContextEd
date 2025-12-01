import type { ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@studyRAG/db";

const FRONTEND_URL = process.env.CORS_ORIGIN;
const isProduction = process.env.NODE_ENV === "production";

export const authConfig: ExpressAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [Google],
	trustHost: true,
	
	cookies: {
		sessionToken: {
			name: `authjs.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
			},
		},
		csrfToken: {
			name: `authjs.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProduction,
			},
		},
		callbackUrl: {
			name: `authjs.callback-url`,
			options: {
				sameSite: "lax",
				path: "/",
				secure: isProduction,
			},
		},
	},

	callbacks: {
		async signIn() {
			return true;
		},
		async redirect({ url, baseUrl }) {
			// Redirect to frontend after successful authentication
			if (url.startsWith("/")) {
				return `${FRONTEND_URL}${url}`;
			}
			if (url.startsWith(baseUrl)) {
				return `${FRONTEND_URL}/dashboard/courses`;
			}
			return `${FRONTEND_URL}/dashboard/courses`;
		},
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
};