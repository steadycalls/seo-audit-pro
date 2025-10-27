import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from 'zod';

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserIntegrations } = await import('./db');
      return getUserIntegrations(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        provider: z.string(),
        apiLogin: z.string(),
        apiPassword: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createIntegration } = await import('./db');
        return createIntegration({
          userId: ctx.user.id,
          provider: input.provider,
          apiLogin: input.apiLogin,
          apiPassword: input.apiPassword,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteIntegration } = await import('./db');
        return deleteIntegration(input.id);
      }),
  }),

  audits: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserAudits } = await import('./db');
      return getUserAudits(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getAuditById } = await import('./db');
        return getAuditById(input.id);
      }),
    getReport: protectedProcedure
      .input(z.object({ auditId: z.number() }))
      .query(async ({ input }) => {
        const { getAuditReport } = await import('./db');
        return getAuditReport(input.auditId);
      }),
    create: protectedProcedure
      .input(z.object({ domain: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { createAudit, getActiveIntegration } = await import('./db');
        const { AuditEngine } = await import('./services/auditEngine');

        // Check for DataForSEO credentials
        const integration = await getActiveIntegration(ctx.user.id, 'dataforseo');
        if (!integration) {
          throw new Error('Please configure DataForSEO API credentials in Integrations');
        }

        // Create audit record
        await createAudit({
          userId: ctx.user.id,
          domain: input.domain,
          status: 'pending',
        });

        // Get the newly created audit
        const { getUserAudits } = await import('./db');
        const audits = await getUserAudits(ctx.user.id);
        const auditId = audits[audits.length - 1]?.id;
        
        if (!auditId) {
          throw new Error('Failed to create audit');
        }

        // Start audit asynchronously (don't await)
        const engine = new AuditEngine({
          auditId,
          domain: input.domain,
          dataForSEOLogin: integration.apiLogin,
          dataForSEOPassword: integration.apiPassword,
        });

        engine.runFullAudit().catch(err => {
          console.error('Audit failed:', err);
        });

        return { auditId };
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
