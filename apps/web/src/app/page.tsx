"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, MessageCircle, GraduationCap, type LucideIcon } from "lucide-react";

const TITLE_TEXT = `
██████╗  ██████╗ ███╗   ██╗████████╗███████╗██╗  ██╗████████╗       ███████╗██████╗ 
██╔════╝ ██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝       ██╔════╝██╔══██╗
██║      ██║   ██║██╔██╗ ██║   ██║   █████╗   ╚███╔╝    ██║   ██████╗█████╗  ██║  ██║
██║      ██║   ██║██║╚██╗██║   ██║   ██╔══╝   ██╔██╗    ██║   ╚═════╝██╔══╝  ██║  ██║
╚██████╗ ╚██████╔╝██║ ╚████║   ██║   ███████╗██╔╝ ██╗   ██║          ███████╗██████╔╝
 ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝          ╚══════╝╚═════╝
 `;

interface Feature {
	icon: LucideIcon;
	tag: string;
	title: string;
	description: string;
	mainImage: string;
	mainImageAlt: string;
}

const features: Feature[] = [
	{
		icon: Upload,
		tag: "Organize",
		title: "Upload Your Course Materials",
		description:
			"Create a course, drop in your lecture notes, PDFs, slides, and handouts. Everything gets organized and processed in the background — so you can jump straight into studying, not sit around waiting.",
		mainImage: "/10 SCENE.png",
		mainImageAlt: "Student studying at a desk with organized materials and a clock",
	},
	{
		icon: MessageCircle,
		tag: "Ask",
		title: "Chat With Jules, Your AI Study Buddy",
		description:
			"Ask questions about your courses and get answers grounded in your actual materials. Jules retrieves the most relevant parts of your notes for accurate, context-aware responses — no hallucinating, no guessing. If it's not in your materials, Jules will tell you.",
		mainImage: "/8 SCENE.png",
		mainImageAlt: "Two people studying together at a table",
	},
	{
		icon: GraduationCap,
		tag: "Learn",
		title: "Two Modes. Your Choice.",
		description:
			"Academic Mode gives you structured, exam-ready explanations with proper terminology. Casual Mode breaks things down with real-world analogies, Feynman-style clarity, and practical exercises. Same source material, different teaching style — pick what makes concepts click for you.",
		mainImage: "/1 SCENE.png",
		mainImageAlt: "Graduates celebrating their achievement with diplomas",
	},
];

export default function Home() {
	return (
		<main className="flex flex-1 flex-col">
			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-4rem)]">
				<div className="max-w-5xl w-full space-y-12 text-center">
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
								Upload your course materials and start chatting! Transform your
								notes into an interactive learning experience. 😉
							</p>
						</div>

						<div className="flex justify-center pt-4">
							<Button
								asChild
								size="lg"
								className="rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-all"
							>
								<Link href="/auth/sign-in">
									Get Started <ArrowRight className="ml-2 size-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="w-full py-20 sm:py-28 lg:py-36 bg-muted/30">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
					{/* Section Header */}
					<div className="text-center mb-16 sm:mb-24">
						<p className="text-sm font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-3">
							Features
						</p>
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
							Everything you need to study smarter
						</h2>
						<p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
							ContextEd turns your course materials into an interactive,
							AI-powered study experience.
						</p>
					</div>

					{/* Feature Rows */}
					<div className="space-y-24 sm:space-y-32 lg:space-y-40">
						{features.map((feature, index) => {
							const isReversed = index % 2 !== 0;
							const Icon = feature.icon;

							return (
								<div
									key={feature.title}
									className={`flex flex-col items-center gap-10 lg:gap-16 ${
										isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
									}`}
								>
									{/* Illustration with overlay */}
									<div className="relative w-full lg:w-1/2 flex justify-center">
										<div className="relative max-w-md w-full">
											{/* Decorative background blob */}
											<div
												className="absolute inset-0 -z-10 scale-110 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl"
												aria-hidden="true"
											/>

											<Image
												src={feature.mainImage}
												alt={feature.mainImageAlt}
												width={480}
												height={480}
												className="relative z-0 w-full h-auto object-contain drop-shadow-sm"
												priority={index === 0}
											/>


										</div>
									</div>

									{/* Text Content */}
									<div className="w-full lg:w-1/2 space-y-4 text-center lg:text-left">
										<div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
											<Icon className="size-4" aria-hidden="true" />
											{feature.tag}
										</div>

										<h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
											{feature.title}
										</h3>

										<p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
											{feature.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>

					{/* Bottom CTA */}
					<div className="mt-20 sm:mt-28 text-center">
						<Button
							asChild
							size="lg"
							className="rounded-full px-8 text-base shadow-lg hover:shadow-xl transition-all"
						>
							<Link href="/auth/sign-in">
								Start studying smarter <ArrowRight className="ml-2 size-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
