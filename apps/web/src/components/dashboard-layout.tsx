import * as React from "react";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";

interface DashboardLayoutProps {
	children: React.ReactNode;
	sidebar: React.ReactNode;
	className?: string;
}

export function DashboardLayout({
	children,
	sidebar,
	className,
}: DashboardLayoutProps) {
	return (
			<SidebarProvider>
				<div className={cn("flex min-h-screen w-full", className)}>
				{sidebar}
				<SidebarInset>
						<header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
						<div className="flex items-center gap-2">
							<SidebarTrigger />
						</div>
						<ModeToggle />
					</header>
						<main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
