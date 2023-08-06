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

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  getToken: t.procedure
    .input(z.object({ userName: z.string().min(1) }))
    .mutation((opts) => {
      return jwt.sign(opts.input, process.env.SECRET_TOKEN!, {
        expiresIn: "1m",
      });
    }),
  getUser: t.procedure.query((opts) => {
    if (opts.ctx.token) {
      return jwt.verify(opts.ctx.token, process.env.SECRET_TOKEN!);
    }

    throw new TRPCError({ code: "UNAUTHORIZED" });
  }),
});

export type AppRouter = typeof appRouter;
