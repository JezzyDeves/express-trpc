import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";
import * as trpcExpress from "@trpc/server/adapters/express";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  token: req.headers["authorization"]
    ? req.headers["authorization"].split(" ")[1]
    : null,
});
type Context = inferAsyncReturnType<typeof createContext>;

const trpc = initTRPC.context<Context>().create();

const auth = trpc.middleware(async (opts) => {
  try {
    if (opts.ctx.token) {
      jwt.verify(opts.ctx.token, process.env.SECRET_TOKEN!);

      return opts.next({
        ctx: opts.ctx,
      });
    }

    throw new Error();
  } catch (error) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
});

export const appRouter = trpc.router({
  getToken: trpc.procedure
    .input(z.object({ userName: z.string().min(1) }))
    .mutation((opts) => {
      return jwt.sign(opts.input, process.env.SECRET_TOKEN!, {
        expiresIn: "1m",
      });
    }),
  getUser: trpc.procedure.use(auth).query((opts) => {
    return jwt.verify(opts.ctx.token!, process.env.SECRET_TOKEN!);
  }),
});

export type AppRouter = typeof appRouter;
