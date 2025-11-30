import { CourseCreationForm } from "@/features/courses/components/course-creation-form";
import { Suspense } from "react";
export default function CreateCoursePage() {
    return (
    <>
        <div className="flex justify-center">
        <Suspense>
        <CourseCreationForm/>
        </Suspense>
        </div>
    </>
    )
}