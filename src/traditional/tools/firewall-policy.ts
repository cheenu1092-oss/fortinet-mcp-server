import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerFirewallPolicyTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_firewall_policies
  server.registerTool(
    "list_firewall_policies",
    {
      description: "List firewall policies with optional filters",
      inputSchema: {
        policyid: z
          .number()
          .optional()
          .describe("Filter by specific policy ID"),
        name: z
          .string()
          .optional()
          .describe("Filter by policy name"),
        status: z
          .enum(["enable", "disable"])
          .optional()
          .describe("Filter by policy status"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.policyid) params["policyid"] = args.policyid.toString();
      if (args.name) params["name"] = args.name;
      if (args.status) params["status"] = args.status;

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
      description: "Get details of a specific firewall policy by ID",
      inputSchema: {
        policyid: z.number().describe("Policy ID"),
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
            .describe("Source interfaces (array of {name: string})"),
          dstintf: z
            .array(z.object({ name: z.string() }))
            .describe("Destination interfaces (array of {name: string})"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Source addresses (array of {name: string})"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Destination addresses (array of {name: string})"),
          service: z
            .array(z.object({ name: z.string() }))
            .describe("Services (array of {name: string})"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .describe("Policy action"),
          schedule: z.string().default("always").describe("Schedule name"),
          status: z
            .enum(["enable", "disable"])
            .default("enable")
            .describe("Policy status"),
          logtraffic: z
            .enum(["all", "utm", "disable"])
            .optional()
            .describe("Log traffic setting"),
          comments: z.string().optional().describe("Policy comments"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          srcintf: args.srcintf,
          dstintf: args.dstintf,
          srcaddr: args.srcaddr,
          dstaddr: args.dstaddr,
          service: args.service,
          action: args.action,
          schedule: args.schedule,
          status: args.status,
        };

        if (args.logtraffic) body.logtraffic = args.logtraffic;
        if (args.comments) body.comments = args.comments;

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
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("New policy status"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .optional()
            .describe("New policy action"),
          comments: z.string().optional().describe("New policy comments"),
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
        const body: Record<string, unknown> = {};

        // Only include fields that are provided
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            body[key] = value;
          }
        });

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          `/cmdb/firewall/policy/${policyid}`,
          body
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated firewall policy ${policyid}: ${JSON.stringify(result, null, 2)}`,
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

    // move_firewall_policy
    server.registerTool(
      "move_firewall_policy",
      {
        description: "Move a firewall policy to a new position (policies are order-dependent)",
        inputSchema: {
          policyid: z.number().describe("Policy ID to move"),
          action: z
            .enum(["before", "after"])
            .describe("Move before or after target"),
          target: z.number().describe("Target policy ID"),
        },
      },
      async (args) => {
        const result = await client.put(
          `/cmdb/firewall/policy/${args.policyid}`,
          {
            action: args.action === "before" ? "move_before" : "move_after",
            target: args.target,
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Moved firewall policy ${args.policyid} ${args.action} policy ${args.target}: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
