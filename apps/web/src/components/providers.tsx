"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				mutationCache: new MutationCache({
					onError: (error) => {
						const message = getErrorMessage(error);
						toast.error(message);
					},
				}),
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors />
			</ThemeProvider>
		</QueryClientProvider>
	);
}
