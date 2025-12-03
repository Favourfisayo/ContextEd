import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";

const f = createUploadthing();

// Server-side session fetch — directly call the Express backend
async function getServerSession(cookieHeader: string | undefined) {
  const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!API_URL) {
    console.error("NEXT_PUBLIC_SERVER_URL is not set");
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/me`, {
      method: "GET",
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.user ? { user: data.user } : null;
  } catch (_error) {
    return null;
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  courseDocumentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    text: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    blob: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const cookieStore = await cookies();

      // Forward all auth-related cookies to the backend
      const allCookies = cookieStore.getAll();
      const cookieHeader = allCookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
      
      const session = await getServerSession(cookieHeader);

      // If you throw, the user will not be able to upload
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId, 
        file_url: file.ufsUrl, 
        file_metadata: {
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        }
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
