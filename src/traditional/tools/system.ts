import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerSystemTools(
  server: McpServer,
  client: FortiGateClient,
  _config: Config
): void {
  // get_system_status
  server.registerTool(
    "get_system_status",
    {
      description: "Get system status and version information",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("monitor/system/status");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    }
  );

  // get_system_performance
  server.registerTool(
    "get_system_performance",
    {
      description: "Get system performance statistics (CPU, memory, sessions)",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("monitor/system/resource/usage");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    }
  );

  // list_interfaces
  server.registerTool(
    "list_interfaces",
    {
      description: "List all network interfaces",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("cmdb/system/interface");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    }
  );

  // get_interface
  server.registerTool(
    "get_interface",
    {
      description: "Get specific interface details",
      inputSchema: {
        name: z.string().describe("Interface name"),
      },
    },
    async (args) => {
      const response = await client.get(`cmdb/system/interface/${args.name}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    }
  );
}
