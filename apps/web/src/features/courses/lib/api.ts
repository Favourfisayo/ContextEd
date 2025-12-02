import { parseApiError } from "@/lib/errors";
import { type CourseCreateInput, type CourseDocCreateInput, type CourseUpdateInput } from "@studyrag/shared-schemas";
const API_URL = process.env.NEXT_PUBLIC_SERVER_PROTECTED_URL;

export interface Course {
  id: string;
  course_title: string;
  course_code: string;
  course_description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Create a new course
 */
export async function createCourse(input: CourseCreateInput): Promise<Course> {
  const response = await fetch(`${API_URL}/courses/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update an existing course
 */
export async function updateCourse(courseId: string, input: CourseUpdateInput): Promise<Course> {
  const response = await fetch(`${API_URL}/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create course documents after uploading to UploadThing
 */
export async function createCourseDocuments(
  input: CourseDocCreateInput
): Promise<{ success: boolean; count: number }> {
  const response = await fetch(`${API_URL}/courses/documents/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get all courses for the authenticated user
 */
export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<Course> {
  const response = await fetch(`${API_URL}/courses/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const result = await response.json();
  return result.data;
}


export async function deleteCourse(courseId: string): Promise<void> {
  const response = await fetch(`${API_URL}/courses/${courseId}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }, 
    credentials: "include"
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }
}