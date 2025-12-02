"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { CourseSidebar } from "@/features/courses/components/course-sidebar";
import { useSession } from "@/features/auth/lib/queries";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

export default function DashboardPageLayout({children}: {children:React.ReactNode}) {
    const { data: session, isLoading, isError } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Redirect to sign-in if not authenticated
        if (!isLoading && !session) {
            router.replace("/auth/sign-in");
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

    // Don't render dashboard if not authenticated
    if (!session) {
        return null;
    }

    return (
        <DashboardLayout sidebar={<CourseSidebar />}>
            {children}
        </DashboardLayout>
    );
}