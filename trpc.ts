import { initTRPC } from "@trpc/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import "dotenv/config";

const t = initTRPC.create();

export const appRouter = t.router({
  getToken: t.procedure
    .input(z.object({ userName: z.string().min(1) }))
    .mutation((opts) => {
      return jwt.sign(opts.input, process.env.SECRET_TOKEN!);
    }),
});

export type AppRouter = typeof appRouter;
