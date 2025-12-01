"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Upload, Sparkles } from "lucide-react";

const TITLE_TEXT = `
██████╗  ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗       ███████╗██████╗ 
██╔════╝ ██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝       ██╔════╝██╔══██╗
██║      ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║   ██████╗█████╗  ██║  ██║
██║      ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║   ╚═════╝██╔══╝  ██║  ██║
╚██████╗ ╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║          ███████╗██████╔╝
 ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝          ╚══════╝╚═════╝
 `;

export default function Home() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-4rem)]">
			<div className="max-w-5xl w-full space-y-12 text-center">
				
                {/* Hero Section */}
                <div className="space-y-6">
                    <div className="hidden lg:flex justify-center mb-8">
                        <pre className="text-blue-500 dark:text-blue-400 font-mono text-[10px] xl:text-xs leading-none select-none opacity-90 hover:opacity-100 transition-opacity">
                            {TITLE_TEXT}
                        </pre>
                    </div>

                    <div className="lg:hidden space-y-2">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
                            CONTEXT-ED
                        </h1>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                            Your AI Study Companion
                        </h2>
                        <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto">
                            Upload your course materials and start chatting! 
                            Transform your notes into an interactive learning experience. 😉
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-all">
                            <Link href="/auth/sign-in">
                                Get Started <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>    
			</div>
		</main>
	);
}
