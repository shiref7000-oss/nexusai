// Vercel serverless function entry point
import { handle } from "hono/vercel";
import app from "./boot";

export const config = {
  runtime: "nodejs",
};

export default handle(app);
