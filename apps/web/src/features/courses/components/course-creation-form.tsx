"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { StepIndicator } from "./step-indicator";
import { CourseInfoStep } from "./course-info-step";
import { DocumentUploadStep } from "./document-upload-step";
import { useCourse } from "@/features/courses/lib/queries";
import { useCallback, useEffect, useState } from "react";

export function CourseCreationForm() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	
	// Use state for currentStep to ensure immediate re-renders
	const [currentStep, setCurrentStep] = useState(() => {
		return parseInt(searchParams.get("step") || "1", 10);
	});
	const [courseId, setCourseId] = useState<string | null>(() => {
		return searchParams.get("courseId");
	});

	// Fetch existing course data if courseId exists (for updates in the case the user goes back when creating a course)
	const { data: existingCourse } = useCourse(courseId || "");

	// Sync state with URL params when they change
	useEffect(() => {
		const stepFromUrl = parseInt(searchParams.get("step") || "1", 10);
		const courseIdFromUrl = searchParams.get("courseId");
		
		if (stepFromUrl !== currentStep) {
			setCurrentStep(stepFromUrl);
		}
		if (courseIdFromUrl !== courseId) {
			setCourseId(courseIdFromUrl);
		}
	}, [searchParams]);

	// Set initial step in URL if not present
	useEffect(() => {
		if (!searchParams.has("step")) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("step", "1");
			window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
		}
	}, []);

	const updateStep = useCallback(
		(step: number, newCourseId?: string) => {
			// Update state immediately for instant UI update
			setCurrentStep(step);
			
			if (newCourseId) {
				setCourseId(newCourseId);
			}

			// Also update URL for browser history
			const params = new URLSearchParams(searchParams.toString());
			params.set("step", step.toString());
			
			if (newCourseId) {
				params.set("courseId", newCourseId);
			} else if (courseId) {
				params.set("courseId", courseId);
			}

			const newUrl = `${pathname}?${params.toString()}`;
			router.push(newUrl as any);
		},
		[searchParams, pathname, courseId, router]
	);

	const steps = [
		{
			number: 1,
			label: "Course Info",
			isActive: currentStep === 1,
			isCompleted: currentStep > 1,
		},
		{
			number: 2,
			label: "Upload Documents",
			isActive: currentStep === 2,
			isCompleted: false,
		},
	];

	const handleNext = useCallback((newCourseId: string) => {
		if (currentStep < 2) {
			updateStep(currentStep + 1, newCourseId);
		}
	}, [currentStep, updateStep]);

	const handleBack = useCallback(() => {
		if (currentStep > 1) {
			updateStep(currentStep - 1);
		}
	}, [currentStep, updateStep]);
	return (
		<div className="flex min-h-full flex-col space-y-8 py-8">
			{/* Step Indicator */}
			<StepIndicator steps={steps} />

			{/* Step Content - Only show current step */}
			{
			currentStep === 1 && (
				<CourseInfoStep 
					onNext={handleNext} 
					courseId={courseId}
					initialData={existingCourse ? {
						course_title: existingCourse.course_title,
						course_code: existingCourse.course_code,
						course_description: existingCourse.course_description,
					} : undefined}
				/>
			)}
			{currentStep === 2 && courseId && (
				<DocumentUploadStep 
					onBack={handleBack} 
					courseId={courseId}
				/>
			)}
		</div>
	);
}
