import { DashboardLayout } from "@/components/dashboard-layout";
import { CourseSidebar } from "@/features/courses/components/course-sidebar";

export default function DashboardPageLayout({children}: {children:React.ReactNode}) {
    return (
        <>
        <DashboardLayout sidebar = {<CourseSidebar/>}>
            {children}
        </DashboardLayout>
        </>
    )
}