import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  reportAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete for userId:", metadata);
    console.log("file url", file.ufsUrl);
    return { uploadedBy: metadata };
  }),
  candidateImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Candidate image upload complete:", metadata);
    console.log("file url", file.ufsUrl);
    return { uploadedBy: metadata };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
