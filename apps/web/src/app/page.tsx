"use client";

import Link from "next/link";

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
		<main className="min-h-screen flex items-center justify-center">
			<div className="max-w-3xl w-full px-6">
				<div className="flex flex-col items-center text-center gap-8">
					<pre className="overflow-x-auto text-blue-400 font-mono text-sm">{TITLE_TEXT}</pre>
						<p className="text-xl">Upload your course materials and start chatting! 😉</p>
						<div className="flex justify-center">
							<Link
								href="/auth/sign-in"
								className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								Get Started
							</Link>
						</div>				
				</div>
			</div>
		</main>
	);
}
