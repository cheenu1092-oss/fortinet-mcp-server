#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiGateClient } from "../client.js";
import { registerFirewallTools } from "./tools/firewall.js";
import { registerAddressTools } from "./tools/address.js";
import { registerSystemTools } from "./tools/system.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new FortiGateClient(config);

  const server = new McpServer({
    name: "fortinet-mcp-server",
    version: "1.0.0",
  });

  registerFirewallTools(server, client, config);
  registerAddressTools(server, client, config);
  registerSystemTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (config.enableWrite) {
    process.stderr.write("[fortinet-mcp] Write mode ENABLED\n");
  } else {
    process.stderr.write(
      "[fortinet-mcp] Read-only mode (pass --enable-write to enable mutations)\n"
    );
  }
}

main().catch((err) => {
  process.stderr.write(`[fortinet-mcp] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
