"use client"

import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteCourse } from "../lib/mutations"
import { toast } from "sonner"
import Loader from "@/components/loader"
import { useRouter } from "next/navigation"

interface CourseActionsProps {
  courseId: string
}
export function CourseActionsDialog({courseId}: CourseActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteCourseMutation = useDeleteCourse()
  const router = useRouter()
  const handleDelete = () => {
    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => {
        toast.success("Course deleted successfully")
        setShowDeleteDialog(false)
        router.push("/dashboard/courses")
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete course")
      }
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="cursor-pointer"  asChild>
          <Button variant="ghost" aria-label="Open menu" size="icon-sm">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="center">
          <DropdownMenuLabel>Course Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            {/* <DropdownMenuItem >
              Update Course
            </DropdownMenuItem> */}
            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
              Delete Course
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog  open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
                This Action cannot be undone, please confirm before deleting
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleteCourseMutation.isPending}>Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              type="submit" 
              onClick={handleDelete}
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? <Loader text="Deleting..." /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
