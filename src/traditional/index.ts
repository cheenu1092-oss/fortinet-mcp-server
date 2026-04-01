#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiApiClient } from "../client.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerAddressTools } from "./tools/address.js";
import { registerSystemTools } from "./tools/system.js";

async function main() {
  const config = loadConfig();
  const client = new FortiApiClient(config);
  const server = new McpServer({
    name: "fortinet-mcp-server",
    version: "1.0.0",
  });

  // Register tool modules
  registerFirewallTools(server, client, config);
  registerAddressTools(server, client, config);
  registerSystemTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP server running on stdio");
  console.error(`Write operations: ${config.enableWrite ? "ENABLED" : "DISABLED"}`);
  console.error(`VDOM: ${config.vdom}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
