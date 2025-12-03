import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
	number: number;
	label: string;
	isActive: boolean;
	isCompleted: boolean;
}

interface StepIndicatorProps {
	steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
	return (
		<div className="flex w-full max-w-2xl mx-auto items-center justify-between px-4 sm:px-0">
			{steps.map((step, index) => (
				<React.Fragment key={step.number}>
					{/* Step Circle and Label */}
					<div className="flex items-center gap-2 sm:gap-3">
						{/* Circle */}
						<div
							className={cn(
								"flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm sm:text-base transition-colors duration-200 border",
								step.isActive || step.isCompleted
									? "bg-blue-600 border-blue-600 text-white"
									: "bg-white border-gray-300 text-gray-500"
							)}
						>
							{step.number}
						</div>

						{/* Label */}
						<span
							className={cn(
								"text-sm sm:text-base font-medium whitespace-nowrap",
								step.isActive || step.isCompleted
									? "text-blue-700"
									: "text-gray-500"
							)}
						>
							{step.label}
						</span>
					</div>

					{/* Connector Line (not for last step) */}
					{index < steps.length - 1 && (
						<div className={cn(
							"h-0.5 flex-1 mx-2 sm:mx-4 transition-colors duration-200",
							step.isCompleted ? "bg-blue-600" : "bg-gray-200"
						)} />
					)}
				</React.Fragment>
			))}
		</div>
	);
}
