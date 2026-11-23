# Claude AI relay for the Lesson Planner

The planner website is public, so it can't hold the Anthropic API key. This small Cloudflare Worker sits between the website and Claude:

```
Teacher's browser  ->  this relay (holds the key as a secret)  ->  Claude API (Anthropic)
```

**The API key is never written in this repository.** It is stored only as an encrypted Cloudflare secret.

## One-time setup (about 10 minutes)

You need:

- An Anthropic API key from the [Anthropic Console](https://console.anthropic.com), with credits loaded.
- A free Cloudflare account.
- Node.js on your computer.

1. Open a terminal in this `worker` folder and install the tools:

   ```bash
   npm install
   ```

2. Log in to Cloudflare. This opens your browser.

   ```bash
   npx wrangler login
   ```

3. Store the API key as a secret. Paste the key when asked. It goes straight to Cloudflare and is never saved in a file.

   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   ```

4. Publish the relay:

   ```bash
   npx wrangler deploy
   ```

   It prints an address like `https://thka-planner-ai.<your-name>.workers.dev`.

5. Put that address in `js/config.js` on the website:

   ```js
   var CLAUDE_RELAY_URL = "https://thka-planner-ai.<your-name>.workers.dev";
   ```

   Commit and push. The site shows **● Claude AI ready** in the Make an activity box once it's live.

## Protecting your bill

- **Set a monthly spend limit** in the Anthropic Console (Settings → Limits). This is the hard ceiling on cost.
- Only the address in `ALLOWED_ORIGINS` (`wrangler.toml`) may use the relay. If the site moves to a new address, update it and run `npx wrangler deploy` again.
- Each visitor is limited to 20 AI requests per minute (the `[[ratelimits]]` block in `wrangler.toml`).
- The relay fixes the model (Claude Opus 5.5), the effort level and the answer length. Callers can't change them, and long prompts are rejected.
- Note that the website-address check is enforced by browsers. Someone determined could still call the relay from a script, so the spend limit and rate limit are the real protection.

## Changing or removing the key

- To change the key, run `npx wrangler secret put ANTHROPIC_API_KEY` again.
- If the key ever leaks, delete it in the Anthropic Console, then set a new one.
- To turn the AI off for everyone, set `CLAUDE_RELAY_URL = ""` in `js/config.js`. The planner then uses the free built-in activity bank.

## Tests

```bash
npm test
```

The tests run the relay against a fake Claude server, so they need no key and cost nothing.

To view live logs while teachers use the site, run `npx wrangler tail`.
