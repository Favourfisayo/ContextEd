import "dotenv/config";
import cors from "cors";
import express from "express";
import { authHandler } from "./auth";
import { authSession } from "./features/auth/middleware/authSession";
import protectedRoutes from "./routes/protected.routes";
import { errorHandler, notFoundHandler } from "./lib/errors";
import timeout from "connect-timeout"
import {rateLimit} from "express-rate-limit"

const app = express();

// Ensure Auth.js trusts the host header (critical for Vercel rewrites)
process.env.AUTH_TRUST_HOST = "true";

// If app is served through a proxy, trust the proxy to allow HTTPS protocol to be detected
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust the first proxy (Fly.io load balancer)
}

//Timeout handler
app.use(timeout("30s"))

//RateLimiting handler
const limiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	limit: 100, // Limit each IP to 100 requests per windowMs
	message: {
		success: false,
		error: {
			message: "Too many requests from this IP, please try again later.",
			code: 'RATE_LIMIT_EXCEEDED',
		}
	},
	standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
	legacyHeaders: false // Disable `X-RateLimit-*` headers
})

app.use(limiter) //Apply rate limiter globally
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "",
		methods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
		credentials: true,
	}),
); 

app.use(express.json());

// Auth.js routes - handles signin, callback, signout, session, and so on..
app.use("/auth", authHandler);

// Apply session middleware to all other routes
app.use(authSession);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.get("/api/me", (_req, res) => {
	const { session } = res.locals;
	res.json({ user: session?.user || null });
});

// Protected routes
app.use("/api/protected", protectedRoutes);

// 404 handler - must come after all routes
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorHandler);

// Handle unhandled promise rejections (e.g. failed DB connection, async errors outside Express)
process.on("unhandledRejection", (reason: Error | any) => {
	console.error("Unhandled Rejection:", reason);
	// In production, we exit here to let a process manager restart the app
	if(process.env.NODE_ENV === "production"){
		process.exit(1);
	}
});

// Handle uncaught exceptions (synchronous errors not caught by try/catch)
process.on("uncaughtException", (error: Error) => {
	console.error("Uncaught Exception:", error);
	// Uncaught exceptions leave the application in an undefined state
	// It is recommended to exit and let the process manager restart
	process.exit(1);
});

const port = process.env.PORT;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
