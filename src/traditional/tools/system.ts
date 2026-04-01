import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiApiClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerSystemTools(
  server: McpServer,
  client: FortiApiClient,
  config: Config
): void {
  // get_system_status
  server.registerTool(
    "get_system_status",
    {
      description: "Get system status (version, uptime, resources)",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("/monitor/system/status");
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
      };
    }
  );

  // get_system_resources
  server.registerTool(
    "get_system_resources",
    {
      description: "Get system resource usage (CPU, memory, disk)",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("/monitor/system/resource/usage");
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
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
      const params: Record<string, string> = {};
      if (args.name) params["name"] = args.name;

      const response = await client.get("/cmdb/system/interface", params);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
      };
    }
  );

  // get_interface
  server.registerTool(
    "get_interface",
    {
      description: "Get a specific interface by name",
      inputSchema: {
        name: z.string().describe("Interface name"),
      },
    },
    async (args) => {
      const response = await client.get(`/cmdb/system/interface/${args.name}`);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
      };
    }
  );

  // list_static_routes
  server.registerTool(
    "list_static_routes",
    {
      description: "List static routes",
      inputSchema: {},
    },
    async () => {
      const response = await client.get("/cmdb/router/static");
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
      };
    }
  );

  // get_sessions
  server.registerTool(
    "get_sessions",
    {
      description: "Get active sessions (connections)",
      inputSchema: {
        count: z.number().optional().describe("Number of sessions to return (default: 100)"),
        srcaddr: z.string().optional().describe("Filter by source IP"),
        dstaddr: z.string().optional().describe("Filter by destination IP"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.count) params["count"] = String(args.count);
      if (args.srcaddr) params["srcaddr"] = args.srcaddr;
      if (args.dstaddr) params["dstaddr"] = args.dstaddr;

      const response = await client.get("/monitor/firewall/session", params);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
      };
    }
  );
}
