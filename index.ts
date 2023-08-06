import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter, createContext } from "./trpc";

const app = express();

app.use(express.json());

app.use(
  "/",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
