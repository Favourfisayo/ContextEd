"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseCreateSchema, type CourseCreateInput } from "@studyrag/shared-schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateCourse, useUpdateCourse } from "@/features/courses/lib/mutations";
import { toast } from "sonner";
import Loader from "@/components/loader";

interface CourseInfoStepProps {
	onNext: (courseId: string) => void;
	courseId?: string | null;
	initialData?: CourseCreateInput;
}

export function CourseInfoStep({ onNext, courseId, initialData }: CourseInfoStepProps) {
	const isUpdateMode = !!courseId;
	
	const createCourseMutation = useCreateCourse();
	const updateCourseMutation = useUpdateCourse();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CourseCreateInput>({
		resolver: zodResolver(courseCreateSchema),
		defaultValues: initialData || {
			course_title: "",
			course_code: "",
			course_description: "",
		},
	});

	const createCourseEntry = (data: CourseCreateInput) => {
		if (isUpdateMode) {
			// Update existing course
			updateCourseMutation.mutate(
				{
					courseId: courseId!,
					input: data,
				},
				{
					onSuccess: (updatedCourse) => {
						toast.success("Course updated successfully");
						onNext(updatedCourse.id);
					},
				}
			);
		} else {
			// Create new course
			createCourseMutation.mutate(data, {
				onSuccess: (newCourse) => {
					toast.success("Course created successfully");
					onNext(newCourse.id);
				},
			});
		}
	};

	const isLoading = createCourseMutation.isPending || updateCourseMutation.isPending;

	return (
		<form onSubmit={handleSubmit(createCourseEntry)} className="mx-auto w-full max-w-2xl space-y-8">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold text-gray-800">
					{isUpdateMode ? "Update Course" : "Create New Course"}
				</h1>
				<p className="text-base text-gray-600">
					Step 1: Enter your course information
				</p>
			</div>

			{/* Form Fields */}
			<div className="space-y-6">
				{/* Course Code Field */}
				<div className="space-y-2">
					<Label htmlFor="course-code" className="text-sm font-medium text-gray-700">
						Course Code
					</Label>
					<Input
						id="course-code"
						placeholder="e.g., CS101"
						className="h-12 border-2 border-gray-300 bg-gray-50 text-base"
						{...register("course_code")}
						aria-invalid={!!errors.course_code}
					/>
					{errors.course_code && (
						<p className="text-sm text-red-600">{errors.course_code.message}</p>
					)}
				</div>

				{/* Course Title Field */}
				<div className="space-y-2">
					<Label htmlFor="course-title" className="text-sm font-medium text-gray-700">
						Course Title
					</Label>
					<Input
						id="course-title"
						placeholder="e.g., Advanced JavaScript"
						className="h-12 border-2 border-gray-300 bg-gray-50 text-base"
						{...register("course_title")}
						aria-invalid={!!errors.course_title}
					/>
					{errors.course_title && (
						<p className="text-sm text-red-600">{errors.course_title.message}</p>
					)}
				</div>

				{/* Description Field (Optional) */}
				<div className="space-y-2">
					<Label htmlFor="description" className="text-sm font-medium text-gray-700">
						Description <span className="text-gray-400">(Optional)</span>
					</Label>
					<Textarea
						id="description"
						placeholder="Describe what this course covers..."
						className="min-h-24 border-2 border-gray-300 bg-gray-50 text-base"
						{...register("course_description")}
					/>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					className="h-10 border-2 border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
					onClick={() => window.history.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="h-10 border-2 border-blue-300 bg-blue-100 text-blue-600 hover:bg-blue-200"
					disabled={isLoading}
				>
					{isLoading ? (
						<Loader text={isUpdateMode ? "Updating..." : "Creating..."}/>
					) : (
						"Next"
					)}
				</Button>
			</div>
		</form>
	);
}
