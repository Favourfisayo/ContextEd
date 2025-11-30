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
		<div className="flex items-center justify-center gap-4">
			{steps.map((step, index) => (
				<React.Fragment key={step.number}>
					{/* Step Circle and Label */}
					<div className="flex items-center gap-2">
						{/* Circle */}
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-sm",
								step.isActive || step.isCompleted
									? "bg-blue-500 text-white"
									: "bg-gray-300 text-gray-600"
							)}
						>
							{step.number}
						</div>

						{/* Label */}
						<span
							className={cn(
								"text-base font-medium",
								step.isActive || step.isCompleted
									? "text-blue-600"
									: "text-gray-500"
							)}
						>
							{step.label}
						</span>
					</div>

					{/* Connector Line (not for last step) */}
					{index < steps.length - 1 && (
						<div className="h-0.5 w-16 bg-gray-300" />
					)}
				</React.Fragment>
			))}
		</div>
	);
}
