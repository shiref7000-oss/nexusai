// Vercel serverless function entry point
import { handle } from "hono/vercel";
import app from "./boot";

export const config = {
  runtime: "nodejs20.x",
};

// @ts-ignore — handle expects standard Hono, our app uses node-server bindings
export default handle(app);
