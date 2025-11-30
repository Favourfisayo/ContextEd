"use client"
import { cn } from "@/lib/utils";
import { BookCopy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppLogoProps {
	className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
	const pathname = usePathname()

	const href = pathname?.startsWith("/dashboard") ? "/dashboard/courses" : "/";

	return (
		<Link href={href} aria-label="StudyRAG home">
			<div className={cn("flex items-center gap-2 cursor-pointer", className)}>
				<div className="flex h-8 w-8 items-center justify-center rounded-lg">
					<BookCopy className="h-5 w-5 text-gray-900" />
				</div>
				<span className="text-lg font-bold text-gray-900 dark:text-gray-100">
					ContextEd
				</span>
			</div>
		</Link>
	);
}
