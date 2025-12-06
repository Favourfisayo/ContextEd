"use client"
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/features/auth/components/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCourses } from "../lib/queries";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/app-logo";
import { CourseActionsDialog } from "./course-actions-dialog";
import { Activity, Suspense } from "react";
import type { Route } from "next";


export function CourseSidebar() {
	const { data: courses } = useCourses();
	const pathname = usePathname();
	
	return (
		<Sidebar>
			<SidebarHeader>
				<AppLogo/>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<Link href={"/dashboard/courses/new" as Route}>
					<Button className="h-10 w-full justify-start gap-2 border-2 border-blue-300 bg-blue-100 text-sm text-blue-600 hover:bg-blue-200">
						<Plus className="h-4 w-4" />
						Create New Course
					</Button>
					</Link>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>My Courses</SidebarGroupLabel>
					
					<Activity mode={courses && courses.length === 0 ? "visible" : "hidden"}>
						<div className="flex flex-col items-center py-6">
							<BookOpen className="mb-2 h-8 w-8 text-gray-400" />
							<p className="text-sm text-gray-500">No courses yet</p>
						</div>
					</Activity>
					
					<Activity  mode={courses && courses.length > 0 ? "visible" : "hidden"}>
						<SidebarMenu>
							{courses && courses.map((course) => {
								const isActive = pathname === `/dashboard/courses/${course.id}`;
								
								return (
									<Suspense fallback={<p>Loading courses....</p>}>
									<SidebarMenuItem key={course.id}>
										<div
											className={cn(
												"group flex w-full items-center rounded-md transition-colors",
												isActive
													? "bg-blue-100 text-blue-900"
													: "hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<Link
												href={`/dashboard/courses/${course.id}` as Route}
												className="flex flex-1 flex-col items-start gap-1 py-3 px-3 min-w-0"
											>
												<span
													className={cn(
														"font-semibold text-sm truncate w-full",
														isActive && "text-blue-700",
													)}
												>
													{course.course_code}
												</span>
												<span
													className={cn(
														"text-xs font-normal line-clamp-2 leading-snug w-full",
														isActive
															? "text-blue-600"
															: "text-muted-foreground",
													)}
												>
													{course.course_title}
												</span>
											</Link>
											<div className="pr-2">
												<CourseActionsDialog courseId={course.id}/>
											</div>
										</div>
									</SidebarMenuItem>
									</Suspense>
								);
							})}
						</SidebarMenu>
					</Activity>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<div className="flex items-center gap-2 px-2 py-2">
					<NavUser/>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
