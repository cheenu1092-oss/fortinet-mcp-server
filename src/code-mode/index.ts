#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiGateClient } from "../client.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new FortiGateClient(config);

  const server = new McpServer({
    name: "fortinet-mcp-server-code-mode",
    version: "1.0.0",
  });

  // TODO: Implement code-mode executor that exposes full FortiGate API schema
  // For now, this is a stub

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write("[fortinet-mcp] Code mode (under development)\n");
}

main().catch((err) => {
  process.stderr.write(`[fortinet-mcp] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
