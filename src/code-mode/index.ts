#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiClient } from "../client.js";

// TODO: Implement code-mode executor tool
// This will be a single execute_fortigate_api tool that accepts natural language

async function main(): Promise<void> {
  const config = loadConfig();

  const client = new FortiClient({
    host: config.host,
    apiKey: config.apiKey,
    vdom: config.vdom,
    verifySsl: config.verifySsl,
  });

  const server = new McpServer({
    name: "fortinet-mcp-server-code-mode",
    version: "1.0.0",
  });

  // TODO: Register code-mode executor tool here

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(
    "[fortinet-mcp-code] Code Mode - TODO: Implement executor\n"
  );
  process.stderr.write(`[fortinet-mcp-code] Connected to: ${config.host}\n`);
}

main().catch((error) => {
  process.stderr.write(`[fortinet-mcp-code] Fatal error: ${String(error)}\n`);
  process.exit(1);
});
