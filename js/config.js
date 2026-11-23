/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/*
  Site settings.

  CLAUDE_RELAY_URL is the web address of the planner's Claude AI relay (the Cloudflare Worker in
  the worker/ folder; see worker/README.md). It is NOT a secret: the Anthropic API key lives only
  on Cloudflare as an encrypted secret and never appears in this website.

  Leave it empty ("") and the planner uses the free built-in activity bank only.
  The address must end in .workers.dev, or be added to connect-src in index.html.
*/
var CLAUDE_RELAY_URL = "";
