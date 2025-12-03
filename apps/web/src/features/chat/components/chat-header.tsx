"use client";


import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import UploadDocumentsButton from "@/features/courses/components/upload-documents-button";
import { useEffect } from "react";
import type { Route } from "next";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
	courseTitle?: string;
	courseId: string
}

export function ChatHeader({
	courseTitle,
	courseId
}: ChatHeaderProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const activeMode = searchParams.get("mode") || "academic";

	// Ensure mode is in URL on mount
	useEffect(() => {
		if (!searchParams.has("mode")) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("mode", "academic");
			router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
		}
	}, [searchParams, router, pathname]);

	const handleModeChange = (mode: string) => {
		if (mode === activeMode) return;

		const params = new URLSearchParams(searchParams.toString());
		params.set("mode", mode);
		router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
	};

	const isMobile = useIsMobile()
	return (
		<div className={cn("flex h-16 items-center sticky top-0  justify-between border-b px-4", isMobile && "h-auto py-2 flex-col gap-2")}>
			{/* Course Title */}
			<h1 className="text-base font-semibold text-gray-800 truncate w-full text-center sm:text-left">
				{courseTitle}
			</h1>

			{/* Mode Toggle Buttons */}
			<div className="flex gap-2 items-center w-full sm:w-auto justify-center sm:justify-end">
				<UploadDocumentsButton courseId={courseId}/>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleModeChange("academic")}
					className={cn(
						"flex-1 sm:flex-none",
						activeMode === "academic"
							? "border-2 border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
							: "border-2 border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
					)}
				>
					Academic 👨‍🏫
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleModeChange("casual")}
					className={cn(
						"flex-1 sm:flex-none",
						activeMode === "casual"
							? "border-2 border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200"
							: "border-2 border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
					)}
				>
					Casual 🚀
				</Button>
			</div>
		</div>
	);
}
