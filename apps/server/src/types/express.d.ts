import type { Session } from "@auth/express";

declare global {
	namespace Express {
		interface Locals {
			session?: Session | null;
		}
	}
}

export {};
