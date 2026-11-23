/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/*
  Treehouse Kids Academy Lesson Planner: Claude AI relay (Cloudflare Worker).

  The planner website is public, so it must never hold the Anthropic API key. Instead the page
  sends its prompt here; this worker adds the key (stored as an encrypted Cloudflare secret
  named ANTHROPIC_API_KEY, never in code) and streams Claude's answer back.

  Guard rails, so nobody can use this relay as a free general-purpose AI:
  - Only the planner's own web address may call it (ALLOWED_ORIGINS).
  - The model, effort level and answer length are fixed here, not chosen by the caller.
  - Prompt sizes are capped, and an optional rate limit caps requests per visitor.

  Reply format: one JSON object per line.
    {"t":"some text"}                 a piece of the answer, in order
    {"done":true,"stop":"end_turn"}   finished ("refusal" means Claude declined: discard the text)
    {"error":"..."}                   something went wrong part-way
*/
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
const MAX_SYSTEM_CHARS = 6000;
const MAX_MESSAGE_CHARS = 4000;
const MAX_MESSAGES = 4;
// max_tokens covers Claude's thinking plus the visible answer; the planner's answers are short.
const MAX_TOKENS = 4000;
// Visible answer budget the page may ask for (roughly the old on-device limits), in tokens.
const MIN_VISIBLE = 20, MAX_VISIBLE = 600;

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const list = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(origin) ? origin : null;
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(status, body, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// Checks the page's request and returns {system, messages, visible} or an error string.
export function readBody(b) {
  if (!b || typeof b !== "object") return "Bad request.";
  const system = typeof b.system === "string" ? b.system : "";
  if (system.length > MAX_SYSTEM_CHARS) return "Instructions too long.";
  if (!Array.isArray(b.messages) || !b.messages.length || b.messages.length > MAX_MESSAGES) return "Bad messages.";
  const messages = [];
  for (const m of b.messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return "Bad messages.";
    if (!m.content.trim() || m.content.length > MAX_MESSAGE_CHARS) return "Message empty or too long.";
    messages.push({ role: m.role, content: m.content });
  }
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return "Bad messages.";
  let visible = Math.round(Number(b.max) || 300);
  visible = Math.min(MAX_VISIBLE, Math.max(MIN_VISIBLE, visible));
  return { system, messages, visible };
}

export default {
  async fetch(request, env, ctx) {
    const origin = allowedOrigin(request, env);
    if (!origin) return json(403, { error: "This address is not allowed to use the planner's AI." });
    const h = cors(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (request.method !== "POST") return json(405, { error: "Use POST." }, h);
    if (!env.ANTHROPIC_API_KEY) return json(500, { error: "The AI key has not been set up on the server yet." }, h);

    if (env.LIMITER) {
      const who = request.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.LIMITER.limit({ key: who });
      if (!success) return json(429, { error: "Too many AI requests in a short time. Please wait a minute and try again." }, h);
    }

    let body;
    try {
      const text = await request.text();
      if (text.length > MAX_SYSTEM_CHARS + MAX_MESSAGES * MAX_MESSAGE_CHARS + 2000) return json(413, { error: "Request too large." }, h);
      body = readBody(JSON.parse(text));
    } catch (e) {
      body = "Bad request.";
    }
    if (typeof body === "string") return json(400, { error: body }, h);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, baseURL: env.ANTHROPIC_BASE_URL || undefined, maxRetries: 1 });
    const params = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Short, creative classroom answers: low effort keeps thinking (billed as output) small.
      output_config: { effort: "low" },
      // If Claude's safety screening declines a harmless request, Anthropic retries it on its recommended model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: body.messages,
    };
    // The activity instructions repeat on every request; caching them makes repeats cheaper.
    if (body.system) params.system = [{ type: "text", text: body.system, cache_control: { type: "ephemeral" } }];

    const enc = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const out = writable.getWriter();
    const send = (o) => out.write(enc.encode(JSON.stringify(o) + "\n"));
    const charCap = body.visible * 6; // stop paying for an answer that runs far past what the page asked for

    const work = (async () => {
      let stream = null, chars = 0;
      try {
        stream = client.beta.messages.stream(params, { signal: request.signal });
        for await (const ev of stream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            chars += ev.delta.text.length;
            await send({ t: ev.delta.text });
            if (chars > charCap) { stream.abort(); await send({ done: true, stop: "max_tokens" }); return; }
          }
        }
        const msg = await stream.finalMessage();
        await send({ done: true, stop: msg.stop_reason || "end_turn" });
      } catch (e) {
        if (request.signal && request.signal.aborted) return; // the teacher pressed Stop
        let msg = "The AI service had a problem. Please try again.";
        if (e instanceof Anthropic.RateLimitError) msg = "The AI is very busy right now. Please wait a minute and try again.";
        else if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) msg = "The AI key on the server is not working. Ask the site owner to check it.";
        else if (e instanceof Anthropic.BadRequestError) msg = "The AI could not read this request.";
        else if (e instanceof Anthropic.APIConnectionError) msg = "Could not reach the AI service. Please try again.";
        else if (e instanceof Anthropic.APIError && e.status === 529) msg = "The AI is overloaded right now. Please try again in a minute.";
        console.error("Claude request failed:", e && e.status, e && e.message);
        try { await send({ error: msg }); } catch (x) {}
      } finally {
        try { await out.close(); } catch (x) {}
      }
    })();
    if (ctx && ctx.waitUntil) ctx.waitUntil(work);

    return new Response(readable, {
      status: 200,
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", ...h },
    });
  },
};
