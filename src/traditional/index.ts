#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiGateClient } from "../client.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerAddressTools } from "./tools/address.js";

async function main() {
  const config = loadConfig();
  const client = new FortiGateClient(config);

  const server = new McpServer({
    name: "fortinet-mcp-server",
    version: "1.0.0",
  });

  // Register all tool groups
  registerFirewallTools(server, client, config);
  registerAddressTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP Server started (traditional mode)");
  if (config.enableWrite) {
    console.error("⚠️ WRITE OPERATIONS ENABLED — Use with caution");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
