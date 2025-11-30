import * as React from "react";

import { GoogleSignInButton } from "./google-sign-in-button";
import { AppLogo } from "@/components/app-logo";

export function SignInForm() {
	return (
		<div className="mx-auto w-full max-w-md px-4">
			<div className="flex flex-col items-center gap-6 p-6 sm:p-10">

				<div className="flex flex-col items-center gap-2">
						<AppLogo />
					<p className="text-center text-sm text-muted-foreground max-w-xs">
						Sign in to access your courses and document study tools.
					</p>
				</div>

				{/* Divider */}
				<div className="w-full">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="bg-card px-2 text-muted-foreground">Continue with</span>
						</div>
					</div>
				</div>

				<div className="w-full">
					<GoogleSignInButton />
				</div>
			</div>
		</div>
	);
}
