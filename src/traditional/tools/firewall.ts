import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerFirewallTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_firewall_policies
  server.registerTool(
    "list_firewall_policies",
    {
      description: "List all firewall policies with optional filters",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Filter by policy name (exact match)"),
        srcintf: z
          .string()
          .optional()
          .describe("Filter by source interface"),
        dstintf: z
          .string()
          .optional()
          .describe("Filter by destination interface"),
        status: z
          .enum(["enable", "disable"])
          .optional()
          .describe("Filter by policy status"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};

      // Build filter string
      const filters: string[] = [];
      if (args.name) filters.push(`name==${args.name}`);
      if (args.srcintf) filters.push(`srcintf.name==${args.srcintf}`);
      if (args.dstintf) filters.push(`dstintf.name==${args.dstintf}`);
      if (args.status) filters.push(`status==${args.status}`);

      if (filters.length > 0) {
        params.filter = filters.join("&");
      }

      const results = await client.getAll("/cmdb/firewall/policy", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // get_firewall_policy
  server.registerTool(
    "get_firewall_policy",
    {
      description: "Get a specific firewall policy by policy ID",
      inputSchema: {
        policyid: z
          .number()
          .describe("Policy ID (numeric identifier)"),
      },
    },
    async (args) => {
      const result = await client.get(
        `/cmdb/firewall/policy/${args.policyid}`
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_firewall_policy
    server.registerTool(
      "create_firewall_policy",
      {
        description: "Create a new firewall policy",
        inputSchema: {
          name: z.string().describe("Policy name"),
          srcintf: z
            .array(z.object({ name: z.string() }))
            .describe("Source interfaces (e.g., [{name: 'port1'}])"),
          dstintf: z
            .array(z.object({ name: z.string() }))
            .describe("Destination interfaces (e.g., [{name: 'port2'}])"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Source addresses (e.g., [{name: 'LAN-Subnet'}])"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Destination addresses (e.g., [{name: 'all'}])"),
          service: z
            .array(z.object({ name: z.string() }))
            .describe("Services (e.g., [{name: 'HTTPS'}])"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .describe("Action (accept, deny, ipsec)"),
          schedule: z
            .string()
            .optional()
            .describe("Schedule name (default: 'always')"),
          nat: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Enable NAT (default: disable)"),
          comments: z.string().optional().describe("Policy comments"),
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Policy status (default: enable)"),
        },
      },
      async (args) => {
        const body = {
          name: args.name,
          srcintf: args.srcintf,
          dstintf: args.dstintf,
          srcaddr: args.srcaddr,
          dstaddr: args.dstaddr,
          service: args.service,
          action: args.action,
          schedule: args.schedule || "always",
          nat: args.nat || "disable",
          status: args.status || "enable",
          ...(args.comments && { comments: args.comments }),
        };

        const result = await client.post("/cmdb/firewall/policy", body);
        return {
          content: [
            {
              type: "text",
              text: `Created firewall policy: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // update_firewall_policy
    server.registerTool(
      "update_firewall_policy",
      {
        description: "Update an existing firewall policy",
        inputSchema: {
          policyid: z.number().describe("Policy ID to update"),
          name: z.string().optional().describe("New policy name"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .optional()
            .describe("New action"),
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("New status"),
          comments: z.string().optional().describe("New comments"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New source addresses"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New destination addresses"),
          service: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New services"),
        },
      },
      async (args) => {
        const { policyid, ...updates } = args;
        
        if (Object.keys(updates).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          `/cmdb/firewall/policy/${policyid}`,
          updates
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated firewall policy: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // delete_firewall_policy
    server.registerTool(
      "delete_firewall_policy",
      {
        description: "Delete a firewall policy",
        inputSchema: {
          policyid: z.number().describe("Policy ID to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(
          `/cmdb/firewall/policy/${args.policyid}`
        );
        return {
          content: [
            {
              type: "text",
              text: `Deleted firewall policy ${args.policyid}: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
