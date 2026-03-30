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
      description: "Get system status (version, uptime, HA status, etc.)",
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
        filter: z.string().optional().describe("Filter expression"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params.filter = args.filter;

      const results = await client.get("cmdb/system/interface", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // list_dhcp_leases
  server.registerTool(
    "list_dhcp_leases",
    {
      description: "List active DHCP leases",
      inputSchema: {
        interface: z.string().optional().describe("Filter by interface name"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.interface) params.interface = args.interface;

      const results = await client.get("monitor/system/dhcp", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );
}
