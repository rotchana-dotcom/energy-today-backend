/**
 * PDF Report Generator Router
 * 
 * Generates beautiful AI-powered weekly/monthly energy reports
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

export const pdfReportRouter = router({
  /**
   * Generate weekly energy report
   */
  generateWeeklyReport: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        energyData: z.array(z.object({
          date: z.string(),
          score: z.number(),
          type: z.string(),
          intensity: z.string(),
        })),
      })
    )
    .mutation(async ({ input }) => {
      let mdFilePath: string | null = null;
      let pdfFilePath: string | null = null;
      
      try {
        // Step 1: Generate AI insights for the week
        const prompt = `Analyze this week's energy data and create a comprehensive weekly report:

Week: ${input.startDate} to ${input.endDate}

Daily Energy Data:
${input.energyData.map(d => `- ${d.date}: ${d.score}/100 (${d.type}, ${d.intensity})`).join('\n')}

Generate a detailed weekly energy report in markdown format with these sections:

# Weekly Energy Report
## ${input.startDate} to ${input.endDate}

### Executive Summary
[2-3 sentences summarizing the week's energy patterns]

### Energy Overview
[Analysis of overall energy trends, highs and lows]

### Key Insights
1. [First major insight]
2. [Second major insight]
3. [Third major insight]

### Best Days
[Which days had the strongest energy and why]

### Challenging Days
[Which days were difficult and how to handle similar situations]

### Recommendations for Next Week
1. [Specific actionable recommendation]
2. [Specific actionable recommendation]
3. [Specific actionable recommendation]

### Energy Score Breakdown
[Table or list of daily scores with brief notes]

Use professional business language. Be specific and actionable.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const reportContent = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);

        // Step 2: Write markdown to temp file
        mdFilePath = join(tmpdir(), `report-${Date.now()}.md`);
        await writeFile(mdFilePath, reportContent);

        // Step 3: Convert markdown to PDF using manus-md-to-pdf utility
        pdfFilePath = join(tmpdir(), `report-${Date.now()}.pdf`);
        await execAsync(`manus-md-to-pdf "${mdFilePath}" "${pdfFilePath}"`);

        // Step 4: Upload PDF to S3
        const { stdout: pdfUrl } = await execAsync(`manus-upload-file "${pdfFilePath}"`);
        const cleanPdfUrl = pdfUrl.trim();

        if (!cleanPdfUrl || !cleanPdfUrl.startsWith("http")) {
          throw new Error("Failed to upload PDF to S3");
        }

        // Clean up temp files
        await unlink(mdFilePath);
        await unlink(pdfFilePath);

        return {
          success: true,
          reportUrl: cleanPdfUrl,
          reportContent,
        };
      } catch (error) {
        // Clean up temp files on error
        if (mdFilePath) {
          try {
            await unlink(mdFilePath);
          } catch (e) {
            console.error("Failed to clean up markdown file:", e);
          }
        }
        if (pdfFilePath) {
          try {
            await unlink(pdfFilePath);
          } catch (e) {
            console.error("Failed to clean up PDF file:", e);
          }
        }

        console.error("PDF generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF report",
        });
      }
    }),

  /**
   * Generate monthly energy report
   */
  generateMonthlyReport: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        month: z.string(), // YYYY-MM format
        energyData: z.array(z.object({
          date: z.string(),
          score: z.number(),
          type: z.string(),
          intensity: z.string(),
        })),
      })
    )
    .mutation(async ({ input }) => {
      let mdFilePath: string | null = null;
      let pdfFilePath: string | null = null;
      
      try {
        // Step 1: Generate AI insights for the month
        const prompt = `Analyze this month's energy data and create a comprehensive monthly report:

Month: ${input.month}

Daily Energy Data (${input.energyData.length} days):
${input.energyData.map(d => `- ${d.date}: ${d.score}/100 (${d.type}, ${d.intensity})`).join('\n')}

Generate a detailed monthly energy report in markdown format with these sections:

# Monthly Energy Report
## ${input.month}

### Executive Summary
[3-4 sentences summarizing the month's energy patterns and major themes]

### Monthly Energy Trends
[Deep analysis of how energy evolved throughout the month]

### Power Days
[Days with exceptional energy and what made them special]

### Growth Opportunities
[Days that were challenging and lessons learned]

### Pattern Recognition
[Recurring patterns, cycles, and correlations discovered]

### Key Achievements
[What was accomplished during high-energy periods]

### Strategic Recommendations
1. [Major strategic recommendation for next month]
2. [Major strategic recommendation for next month]
3. [Major strategic recommendation for next month]

### Weekly Breakdown
[Brief summary of each week in the month]

### Energy Statistics
- Average Score: [calculate]
- Best Day: [date and score]
- Most Common Energy Type: [type]
- Consistency Rating: [analysis]

Use professional business language. Be specific, insightful, and actionable.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const reportContent = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);

        // Step 2: Write markdown to temp file
        mdFilePath = join(tmpdir(), `monthly-report-${Date.now()}.md`);
        await writeFile(mdFilePath, reportContent);

        // Step 3: Convert markdown to PDF
        pdfFilePath = join(tmpdir(), `monthly-report-${Date.now()}.pdf`);
        await execAsync(`manus-md-to-pdf "${mdFilePath}" "${pdfFilePath}"`);

        // Step 4: Upload PDF to S3
        const { stdout: pdfUrl } = await execAsync(`manus-upload-file "${pdfFilePath}"`);
        const cleanPdfUrl = pdfUrl.trim();

        if (!cleanPdfUrl || !cleanPdfUrl.startsWith("http")) {
          throw new Error("Failed to upload PDF to S3");
        }

        // Clean up temp files
        await unlink(mdFilePath);
        await unlink(pdfFilePath);

        return {
          success: true,
          reportUrl: cleanPdfUrl,
          reportContent,
        };
      } catch (error) {
        // Clean up temp files on error
        if (mdFilePath) {
          try {
            await unlink(mdFilePath);
          } catch (e) {
            console.error("Failed to clean up markdown file:", e);
          }
        }
        if (pdfFilePath) {
          try {
            await unlink(pdfFilePath);
          } catch (e) {
            console.error("Failed to clean up PDF file:", e);
          }
        }

        console.error("PDF generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF report",
        });
      }
    }),
});
