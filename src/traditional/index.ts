#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiGateClient } from "../client.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerAddressTools } from "./tools/address.js";
import { registerSystemTools } from "./tools/system.js";
import { registerServiceTools } from "./tools/service.js";
import { registerVpnTools } from "./tools/vpn.js";

async function main() {
  const config = loadConfig();
  const client = new FortiGateClient(
    config.host,
    config.apiKey,
    config.vdom,
    config.verifySSL
  );

  const server = new McpServer({
    name: "fortinet-mcp-server",
    version: "1.0.0",
  });

  // Register tool categories
  registerFirewallTools(server, client, config);
  registerAddressTools(server, client, config);
  registerSystemTools(server, client, config);
  registerServiceTools(server, client, config);
  registerVpnTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP server running on stdio");
  console.error(`Mode: Traditional (${config.enableWrite ? "read-write" : "read-only"})`);
  console.error(`VDOM: ${config.vdom}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
