"use client";

import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/features/courses/utils/uploadthing";
import { toast } from "sonner";
import { useCreateCourseDocuments } from "@/features/courses/lib/mutations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatFileSize } from "../helpers/file_helpers";
import Loader from "@/components/loader";
import { getErrorMessage } from "@/lib/errors";

interface DocumentUploadStepProps {
	onBack: () => void;
	courseId: string;
}

interface UploadedFile {
	url: string;
	name: string;
	size: number;
	type: string;
	key: string;
}

export function DocumentUploadStep({ onBack, courseId }: DocumentUploadStepProps) {
	const router = useRouter();
	const createDocumentsMutation = useCreateCourseDocuments();
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
		[]
	);
	const MAX_FILES = 5;

	const handleFileRemove = (fileUrl: string) => {
		setUploadedFiles((files) => files.filter((f) => f.url !== fileUrl));
	};


	const canUploadMore = uploadedFiles.length < MAX_FILES;

	const handleCreateCourse = () => {
		if (uploadedFiles.length === 0) {
			toast.error("Please upload at least one document");
			return;
		}

		const documents = uploadedFiles.map((file) => ({
			file_url: file.url,
			file_metadata: {
				name: file.name,
				size: file.size,
				type: file.type,
				key: file.key,
			},
		}));

		createDocumentsMutation.mutate(
			{
				course_id: courseId,
				documents,
			},
			{
				onSuccess: () => {
					toast.success("Course created successfully with documents!");
					router.push(`/dashboard/courses/${courseId}`);
				},
			}
		);
	};

	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-8 px-4 sm:px-0">
			{/* Header */}
			<div className="space-y-2 text-center sm:text-left">
				<h2 className="text-xl sm:text-2xl font-bold text-gray-800">
					Upload Course Documents
				</h2>
				<p className="text-sm sm:text-base text-gray-600">
					Step 2: Upload up to {MAX_FILES} course documents (PDF, Word, CSV, Text)
				</p>
			</div>

			{/* Upload Zone */}
			<div className="space-y-4">
				{canUploadMore && (
					<UploadDropzone
						endpoint="courseDocumentUploader"
						onClientUploadComplete={(res) => {
							if (res) {
								const newFiles = res.map((file) => ({
									url: file.ufsUrl,
									name: file.name,
									size: file.size,
									type: file.type,
									key: file.key,
								}));
								setUploadedFiles((prev) => [...prev, ...newFiles]);
								toast.success("Files uploaded successfully!");
							}
						}}
						onUploadError={(error: Error) => {
							toast.error(`Upload failed: ${getErrorMessage(error)}`);
						}}
						config={{
							mode: "auto",
						}}
						appearance={{
							container: "border-none",
							uploadIcon: "text-blue-500 hover:opacity-50 cursor-pointer",
							label: "text-gray-600",
							allowedContent: "text-gray-500",
							button: "cursor-pointer hover:opacity-50"
						}}
					/>
				)}

				{!canUploadMore && (
					<div className="flex h-32 items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100">
						<p className="text-base text-gray-500">
							Maximum {MAX_FILES} files reached
						</p>
					</div>
				)}

				{/* File Counter */}
				{uploadedFiles.length > 0 && (
					<p className="text-sm text-gray-600 font-medium">
						{uploadedFiles.length} of {MAX_FILES} files uploaded
					</p>
				)}

				{/* File List */}
				{uploadedFiles.length > 0 && (
					<div className="space-y-3">
						{uploadedFiles.map((file) => (
							<div
								key={file.key}
								className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3 sm:px-4 sm:py-3 transition-all hover:bg-green-50"
							>
								<div className="flex items-start gap-3 w-full sm:w-auto min-w-0">
									<div className="p-2 bg-green-100 rounded-md shrink-0">
										<FileText className="h-4 w-4 text-green-600" />
									</div>
									<div className="flex flex-col min-w-0 flex-1">
										<span className="text-sm font-medium text-gray-900 truncate">
											{file.name}
										</span>
										<span className="text-xs text-gray-500">
											{formatFileSize(file.size)}
										</span>
									</div>
								</div>
								
								<button
									type="button"
									onClick={() => handleFileRemove(file.url)}
									className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors self-end sm:self-center"
									aria-label="Remove file"
								>
									<X className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				)}

				{/* Empty State */}
				{uploadedFiles.length === 0 && !canUploadMore && (
					<p className="text-center text-sm text-gray-500">
						No files uploaded yet
					</p>
				)}
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0 pt-4">
				<Button
					type="button"
					onClick={onBack}
					variant="outline"
					className="h-11 sm:h-10 w-full sm:w-auto border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
					disabled={createDocumentsMutation.isPending}
				>
					Back
				</Button>
				<Button
					type="button"
					onClick={handleCreateCourse}
					disabled={uploadedFiles.length === 0 || createDocumentsMutation.isPending}
					className="h-11 sm:h-10 w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
				>
					{createDocumentsMutation.isPending ? (
						<Loader text="Finishing..."/>
					) : (
						"Finish"
					)}
				</Button>
			</div>
		</div>
	);
}
