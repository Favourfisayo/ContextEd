"use client"
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

interface LoaderProps {
	text?: string,
	className?: string
}
export default function Loader({text, className}: LoaderProps) {
	return (
		<>
		<div className={cn("flex gap-2 flex-1 items-center", className)}>
		<Spinner/>
		{text}
		</div>
		</>
	);
}
