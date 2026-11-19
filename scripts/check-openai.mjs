import OpenAI from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(
    new URL("../.env.local", import.meta.url)
  )
});

const apiKey = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_MODEL?.trim();

if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY in .env.local.");
}

if (
  !model ||
  model === "your-selected-openai-model-id"
) {
  throw new Error(
    "Set OPENAI_MODEL to a model available to your API project."
  );
}

const client = new OpenAI({ apiKey });

try {
  const response = await client.responses.create({
    model,
    input: "Reply with exactly: OpenAI connection works",
    store: false
  });

  console.log("Model:", model);
  console.log("Status:", response.status);
  console.log(response.output_text || "No text returned.");
} catch (error) {
  console.error("OpenAI request failed:", error.message);
  process.exitCode = 1;
}