"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { AppLogo } from "./app-logo";
import { Button } from "./ui/button";
import { useSession } from "@/features/auth/lib/queries";
import UserAvatar from "@/features/auth/components/user-avatar";

export default function Header() {
	const pathname = usePathname();
	const { data: session } = useSession();

    // Hide header on dashboard routes as they have their own layout
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<AppLogo/>
				</div>

				<div className="flex items-center gap-3">
					<ModeToggle />
					{!session?.user ? (
						// Hide full text button on very small screens to save space
						<Button variant="secondary" asChild size="sm" className="hidden sm:inline-flex">
							<Link href="/auth/sign-in">Get Started</Link>
						</Button>
					) : (
						<Link href="/dashboard/courses">
						    <UserAvatar 
						        user={session.user} 
						        fallbackImage={session.user.email?.slice(0, 2).toUpperCase()} 
						    />
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
