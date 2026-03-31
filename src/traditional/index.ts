#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiClient } from "../client.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerAddressTools } from "./tools/address.js";
import { registerSystemTools } from "./tools/system.js";

async function main(): Promise<void> {
  // Load configuration
  const config = loadConfig();

  // Initialize FortiClient
  const client = new FortiClient({
    host: config.host,
    apiKey: config.apiKey,
    vdom: config.vdom,
    verifySsl: config.verifySsl,
  });

  // Create MCP server
  const server = new McpServer({
    name: "fortinet-mcp-server",
    version: "1.0.0",
  });

  // Register tool categories
  registerFirewallTools(server, client, config);
  registerAddressTools(server, client, config);
  registerSystemTools(server, client, config);

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (config.enableWrite) {
    process.stderr.write("[fortinet-mcp] Write mode ENABLED\n");
  } else {
    process.stderr.write(
      "[fortinet-mcp] Read-only mode (pass --enable-write to enable mutations)\n"
    );
  }
  process.stderr.write(`[fortinet-mcp] Connected to: ${config.host}\n`);
  process.stderr.write(`[fortinet-mcp] VDOM: ${config.vdom}\n`);
}

main().catch((error) => {
  process.stderr.write(`[fortinet-mcp] Fatal error: ${String(error)}\n`);
  process.exit(1);
});
