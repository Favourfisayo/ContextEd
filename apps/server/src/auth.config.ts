import type { ExpressAuthConfig } from "@auth/express";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@studyRAG/db";

const FRONTEND_URL = process.env.CORS_ORIGIN

export const authConfig: ExpressAuthConfig = {
	adapter: PrismaAdapter(prisma),
	providers: [Google],
	trustHost: true,

	callbacks: {
		async signIn() {
			// Allow sign in
			return true;
		},
		async redirect({ url, baseUrl }) {
			// Redirect to frontend after successful authentication
			// If url is relative, use it
			if (url.startsWith("/")) {
				return `${FRONTEND_URL}${url}`;
			}
			// If callback URL is from our backend, redirect to frontend dashboard
			if (url.startsWith(baseUrl)) {
				return `${FRONTEND_URL}/dashboard/courses`;
			}
			// Otherwise redirect to frontend dashboard
			return `${FRONTEND_URL}/dashboard/courses`;
		},
		async session({ session, user }) {
			// Include user id in session
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
};
