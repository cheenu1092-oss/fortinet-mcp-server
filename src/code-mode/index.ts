#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";
import { FortiGateClient } from "../client.js";
import { z } from "zod";

async function main() {
  const config = loadConfig();
  const client = new FortiGateClient(
    config.host,
    config.apiKey,
    config.vdom,
    config.verifySSL
  );

  const server = new McpServer({
    name: "fortinet-mcp-server-code",
    version: "1.0.0",
  });

  // Single executor tool for code mode
  server.registerTool(
    "fortigate_api",
    {
      description:
        "Execute FortiGate REST API calls. Full access to the FortiGate API schema.",
      inputSchema: {
        method: z
          .enum(["GET", "POST", "PUT", "DELETE"])
          .describe("HTTP method"),
        path: z
          .string()
          .describe(
            "API path (e.g., cmdb/firewall/policy or monitor/system/status)"
          ),
        body: z
          .record(z.string(), z.unknown())
          .optional()
          .describe("Request body for POST/PUT"),
        params: z
          .record(z.string(), z.string())
          .optional()
          .describe("Query parameters"),
        mkey: z
          .string()
          .optional()
          .describe("Management key for PUT/DELETE on specific objects"),
      },
    },
    async (args) => {
      let response;

      switch (args.method) {
        case "GET":
          response = await client.get(args.path, (args.params || {}) as Record<string, string>);
          break;
        case "POST":
          if (!args.body) {
            throw new Error("POST requires a body");
          }
          response = await client.post(args.path, args.body);
          break;
        case "PUT":
          if (!args.body || !args.mkey) {
            throw new Error("PUT requires both body and mkey");
          }
          response = await client.put(args.path, args.mkey, args.body);
          break;
        case "DELETE":
          if (!args.mkey) {
            throw new Error("DELETE requires mkey");
          }
          response = await client.delete(args.path, args.mkey);
          break;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP server running on stdio (Code Mode)");
  console.error(`VDOM: ${config.vdom}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
