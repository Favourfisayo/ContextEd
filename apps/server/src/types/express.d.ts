import { auth } from "@/auth";
declare global {
	namespace Express {
		interface Locals {
			session?: typeof auth.$Infer.Session;
		}
	}
}

export {};
