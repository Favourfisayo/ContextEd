import { getSession } from "@/features/auth/lib/api";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";

const f = createUploadthing();

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
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("authjs.session-token");
      
      const cookieHeader = sessionCookie 
        ? `authjs.session-token=${sessionCookie.value}`
        : undefined;
      
      const session = await getSession(cookieHeader);

      
      // If you throw, the user will not be able to upload
      if (!session?.user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

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
