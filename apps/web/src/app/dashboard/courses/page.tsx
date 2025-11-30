"use client"
import { AppLogo } from "@/components/app-logo";
import TypingComponent from "@/features/courses/components/typing-component";

export default function CoursesPage() {
    return (
        <>
        <div className="flex flex-col gap-4 items-center justify-center w-full h-5/6">
        <AppLogo/>
        <TypingComponent/>
        </div>
        </>
    )
}