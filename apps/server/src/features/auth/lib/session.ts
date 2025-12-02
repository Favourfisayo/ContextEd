import { auth } from "@/auth";
import { fromNodeHeaders } from "better-auth/node";
import {type Request } from "express";
export async function getSession(req: Request) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })
    return session
}
export type Session = typeof auth.$Infer.Session