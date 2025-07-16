// src/__mocks__/server.ts
import { setupServer } from "msw/node";
import { rest } from "msw";

export const handlers = [
  rest.get("/api/auth/child/", (req, res, ctx) => {
    return res(
      ctx.json([
        { child_id: 1, name: "Alice", birth_date: "2015-04-01" },
      ])
    );
  }),
  rest.post("/api/chat", async (req, res, ctx) => {
    const { user_input } = await req.json();
    return res(
      ctx.json({
        response: `AI echo: ${user_input}`,
        sentiment: "neutral",
        sentiment_score: 0.5,
        suggested_actions: ["Keep the conversation going"],
      })
    );
  }),
];

export const server = setupServer(...handlers);
