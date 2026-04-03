import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerSystemTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // get_system_status
  server.registerTool(
    "get_system_status",
    {
      description: "Get FortiGate system status and information",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("monitor/system/status");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_interfaces
  server.registerTool(
    "list_interfaces",
    {
      description: "List network interfaces",
      inputSchema: {
        name: z.string().optional().describe("Filter by interface name"),
      },
    },
    async (args) => {
      let results = await client.get<unknown[]>("cmdb/system/interface");

      if (args.name) {
        results = results.filter((i: any) =>
          i.name?.toLowerCase().includes(args.name!.toLowerCase())
        );
      }

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
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
      const result = await client.get(`cmdb/system/interface/${args.name}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_routes
  server.registerTool(
    "list_routes",
    {
      description: "List static routes",
      inputSchema: {},
    },
    async () => {
      const results = await client.get("cmdb/router/static");
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // get_system_performance
  server.registerTool(
    "get_system_performance",
    {
      description: "Get system performance statistics",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("monitor/system/performance/status");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_vdoms
  server.registerTool(
    "list_vdoms",
    {
      description: "List virtual domains (VDOMs)",
      inputSchema: {},
    },
    async () => {
      const results = await client.get("cmdb/system/vdom");
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );
}
