import { ExpressAuth } from "@auth/express";
import { authConfig } from "./auth.config";

export const authHandler = ExpressAuth(authConfig);