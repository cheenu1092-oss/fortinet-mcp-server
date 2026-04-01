#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "../config.js";
import { FortiApiClient } from "../client.js";

async function main() {
  const config = loadConfig();
  const client = new FortiApiClient(config);
  const server = new McpServer({
    name: "fortinet-mcp-server-code-mode",
    version: "1.0.0",
  });

  // Single unified tool: fortinet_api
  server.registerTool(
    "fortinet_api",
    {
      description:
        "Execute FortiGate REST API requests. Supports GET, POST, PUT, DELETE. " +
        "Examples: GET /cmdb/firewall/policy, POST /cmdb/firewall/address, etc.",
      inputSchema: {
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("HTTP method"),
        path: z
          .string()
          .describe(
            "API path (e.g. /cmdb/firewall/policy or /monitor/system/status)"
          ),
        body: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Request body for POST/PUT"),
        params: z
          .record(z.string(), z.string())
          .optional()
          .describe("Query parameters"),
      },
    },
    async (args) => {
      let response;
      const params = args.params as Record<string, string> | undefined;

      switch (args.method) {
        case "GET":
          response = await client.get(args.path, params);
          break;
        case "POST":
          if (!args.body) {
            throw new Error("body is required for POST requests");
          }
          response = await client.post(args.path, args.body, params);
          break;
        case "PUT":
          if (!args.body) {
            throw new Error("body is required for PUT requests");
          }
          response = await client.put(args.path, args.body, params);
          break;
        case "DELETE":
          response = await client.delete(args.path, params);
          break;
        default:
          throw new Error(`Unsupported method: ${args.method}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP server (code-mode) running on stdio");
  console.error(`Write operations: ${config.enableWrite ? "ENABLED" : "DISABLED"}`);
  console.error(`VDOM: ${config.vdom}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
