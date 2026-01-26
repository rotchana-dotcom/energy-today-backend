/**
 * Upload Router
 * 
 * Handles file uploads to S3
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

export const uploadRouter = router({
  /**
   * Upload a file to S3 and get public URL
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileData: z.string(), // Base64 encoded file data
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      let tempFilePath: string | null = null;
      
      try {
        // Create temp file
        const buffer = Buffer.from(input.fileData, "base64");
        tempFilePath = join(tmpdir(), `upload-${Date.now()}-${input.fileName}`);
        await writeFile(tempFilePath, buffer);

        // Upload to S3 using manus-upload-file utility
        const { stdout, stderr } = await execAsync(
          `manus-upload-file "${tempFilePath}"`
        );

        if (stderr) {
          console.error("Upload stderr:", stderr);
        }

        // The utility returns the public URL
        const url = stdout.trim();
        
        if (!url || !url.startsWith("http")) {
          throw new Error("Invalid upload response");
        }

        // Clean up temp file
        await unlink(tempFilePath);

        return {
          success: true,
          url,
        };
      } catch (error) {
        // Clean up temp file on error
        if (tempFilePath) {
          try {
            await unlink(tempFilePath);
          } catch (e) {
            console.error("Failed to clean up temp file:", e);
          }
        }

        console.error("Upload error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }
    }),
});
