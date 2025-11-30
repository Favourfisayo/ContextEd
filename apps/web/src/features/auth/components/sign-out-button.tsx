"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "../lib/mutations";
import Loader from "@/components/loader";

export function SignOutButton() {
	const { mutate: signOut, isPending } = useSignOut();

	return (
		<Button
			variant="outline"
			onClick={() => signOut()}
			disabled={isPending}
			className="w-full"
		>
			{isPending ? (
				<Loader text="Signing out..."/>

			) : (
				"Sign out"
			)}
		</Button>
	);
}
