// Tests the relay against a fake Anthropic server (no real key or network needed).  Run: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import worker from "../src/index.js";

let server, base, last = null, mode = "ok";
const sse = (ev, data) => `event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`;
function stream(text, stop) {
  const msg = { id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, usage: { input_tokens: 10, output_tokens: 0 } };
  let s = sse("message_start", { type: "message_start", message: msg });
  s += sse("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
  for (const piece of text) s += sse("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: piece } });
  s += sse("content_block_stop", { type: "content_block_stop", index: 0 });
  s += sse("message_delta", { type: "message_delta", delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 5 } });
  s += sse("message_stop", { type: "message_stop" });
  return s;
}

before(async () => {
  server = http.createServer((req, res) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      last = { url: req.url, headers: req.headers, body: JSON.parse(b) };
      if (mode === "429") { res.writeHead(429, { "content-type": "application/json" }); return res.end(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "slow down" } })); }
      res.writeHead(200, { "content-type": "text/event-stream" });
      if (mode === "refusal") return res.end(stream(["TITLE: Par"], "refusal"));
      if (mode === "long") return res.end(stream(Array(400).fill("word "), "end_turn"));
      res.end(stream(["TITLE: Dino ", "Stomp\nSTEPS: a | b"], "end_turn"));
    });
  });
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const ORIGIN = "https://thka-lesson-planner.github.io";
const env = () => ({ ANTHROPIC_API_KEY: "sk-test-not-real", ALLOWED_ORIGINS: ORIGIN, ANTHROPIC_BASE_URL: base });
const req = (body, origin = ORIGIN, method = "POST") =>
  new Request("https://relay.example/", { method, headers: { Origin: origin, "Content-Type": "application/json" }, body: method === "POST" ? JSON.stringify(body) : undefined });
const good = { system: "You are a teacher.", messages: [{ role: "user", content: "dinosaurs" }], max: 180 };
const lines = async (res) => (await res.text()).trim().split("\n").map((l) => JSON.parse(l));

test("rejects other websites", async () => {
  const res = await worker.fetch(req(good, "https://evil.example"), env(), {});
  assert.equal(res.status, 403);
});

test("answers the browser's CORS check", async () => {
  const res = await worker.fetch(req(null, ORIGIN, "OPTIONS"), env(), {});
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("rejects oversized or malformed prompts", async () => {
  for (const b of [{ messages: [] }, { system: "x".repeat(7000), messages: good.messages }, { messages: [{ role: "system", content: "hi" }] }, { messages: [{ role: "user", content: "x".repeat(5000) }] }]) {
    const res = await worker.fetch(req(b), env(), {});
    assert.equal(res.status, 400);
  }
});

test("streams Claude's text with fixed model and settings", async () => {
  mode = "ok";
  const res = await worker.fetch(req({ ...good, model: "something-expensive", max_tokens: 99999 }), env(), {});
  assert.equal(res.status, 200);
  const out = await lines(res);
  assert.equal(out.filter((o) => o.t).map((o) => o.t).join(""), "TITLE: Dino Stomp\nSTEPS: a | b");
  assert.deepEqual(out.at(-1), { done: true, stop: "end_turn" });
  assert.equal(last.body.model, "claude-opus-5-5");
  assert.equal(last.body.max_tokens, 4000);
  assert.deepEqual(last.body.output_config, { effort: "low" });
  assert.equal(last.body.fallbacks, "default");
  assert.equal(last.body.temperature, undefined);
  assert.match(String(last.headers["anthropic-beta"]), /server-side-fallback-2026-07-01/);
  assert.equal(last.body.system[0].cache_control.type, "ephemeral");
  assert.ok(last.headers["x-api-key"] === "sk-test-not-real" || last.headers.authorization === "Bearer sk-test-not-real");
});

test("reports a refusal so the page discards the partial answer", async () => {
  mode = "refusal";
  const out = await lines(await worker.fetch(req(good), env(), {}));
  assert.deepEqual(out.at(-1), { done: true, stop: "refusal" });
});

test("stops a runaway answer", async () => {
  mode = "long";
  const out = await lines(await worker.fetch(req({ ...good, max: 20 }), env(), {}));
  assert.deepEqual(out.at(-1), { done: true, stop: "max_tokens" });
  assert.ok(out.filter((o) => o.t).length < 400);
});

test("turns API errors into a friendly message", async () => {
  mode = "429";
  const out = await lines(await worker.fetch(req(good), env(), {}));
  assert.match(out.at(-1).error, /busy/);
});

test("refuses to run without a key", async () => {
  const res = await worker.fetch(req(good), { ALLOWED_ORIGINS: ORIGIN }, {});
  assert.equal(res.status, 500);
});
