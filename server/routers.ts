import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { paymentRouter } from "./payment-router";
import { subscriptionRouter } from "./subscription-router";
import { aiInsightsRouter } from "./ai-insights-router";
import { voiceJournalRouter } from "./voice-journal-router";
import { uploadRouter } from "./upload-router";
import { pdfReportRouter } from "./pdf-report-router";
import { teamRouter } from "./team-router";
import { socialComparisonRouter } from "./social-comparison-router";
import { weatherRouter } from "./weather-router";
import { mealPhotoRouter } from "./meal-photo-router";
import { coachingChatbotRouter } from "./coaching-chatbot-router";
import { taskSchedulerRouter } from "./task-scheduler-router";
import { supportChatRouter } from "./routers/support-chat-router";
import { aiAnalyticsRouter } from "./ai-analytics-router";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  payment: paymentRouter,
  subscription: subscriptionRouter,
  aiInsights: aiInsightsRouter,
  voiceJournal: voiceJournalRouter,
  upload: uploadRouter,
  pdfReport: pdfReportRouter,
  team: teamRouter,
  socialComparison: socialComparisonRouter,
  weather: weatherRouter,
  mealPhoto: mealPhotoRouter,
  coachingChatbot: coachingChatbotRouter,
  taskScheduler: taskSchedulerRouter,
  supportChat: supportChatRouter,
  aiAnalytics: aiAnalyticsRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
