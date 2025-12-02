"use client";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { useSession } from "@/features/auth/lib/queries";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function SignInPage() {
	const { data: session, isLoading } = useSession();
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard if already authenticated
		if (!isLoading && session) {
			router.replace("/dashboard/courses");
		}
	}, [session, isLoading, router]);

	// Show loading state while checking session
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader />
			</div>
		);
	}

	// Don't render sign-in form if already authenticated
	if (session) {
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignInForm />
		</div>
	);
}
