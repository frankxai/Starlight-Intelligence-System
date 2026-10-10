#!/usr/bin/env node
console.warn(
  "\x1b[33m%s\x1b[0m",
  "⚠️  Notice: @arcanea/starlight-intelligence-system has migrated to @starlight-intelligence/system. Please update your dependencies."
);
import "@starlight-intelligence/system/dist/cli.js";
