import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UploadDocumentsButtonProps {
    courseId: string
}

export default function UploadDocumentsButton({ courseId }: UploadDocumentsButtonProps) {
    const isMobile = useIsMobile()
    return (
        <>
        {!isMobile ? 
        <Button variant="outline" size="sm" asChild className="border-2 border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200">  
            <Link href={`/dashboard/courses/new?step=2&courseId=${courseId}`}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
            </Link>
        </Button>
        :
        <Link href={`/dashboard/courses/new?step=2&courseId=${courseId}`}>
                <Upload className="mr-2 h-4 w-4" />
        </Link>
        }
    </>
    )
}