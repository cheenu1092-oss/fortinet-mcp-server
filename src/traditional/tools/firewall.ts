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
      description: "List all firewall policies",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., name==myPolicy)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) {
        params.filter = args.filter;
      }

      const response = await client.get("cmdb/firewall/policy", params);
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

  // get_firewall_policy
  server.registerTool(
    "get_firewall_policy",
    {
      description: "Get a specific firewall policy by ID (policyid)",
      inputSchema: {
        policyid: z.number().describe("Policy ID"),
      },
    },
    async (args) => {
      const response = await client.get(
        `cmdb/firewall/policy/${args.policyid}`
      );
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
            .describe("Source interface(s)"),
          dstintf: z
            .array(z.object({ name: z.string() }))
            .describe("Destination interface(s)"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Source address(es)"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Destination address(es)"),
          service: z
            .array(z.object({ name: z.string() }))
            .describe("Service(s)"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .describe("Policy action"),
          schedule: z
            .string()
            .optional()
            .describe("Schedule name (default: always)"),
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Enable/disable the policy"),
          logtraffic: z
            .enum(["all", "utm", "disable"])
            .optional()
            .describe("Log traffic"),
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
          schedule: args.schedule || "always",
          status: args.status || "enable",
        };

        if (args.logtraffic) body.logtraffic = args.logtraffic;
        if (args.comments) body.comments = args.comments;

        const response = await client.post("cmdb/firewall/policy", body);
        return {
          content: [
            {
              type: "text",
              text: `Created firewall policy: ${JSON.stringify(response.results, null, 2)}`,
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
            .describe("Enable/disable the policy"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .optional()
            .describe("Policy action"),
          comments: z.string().optional().describe("Policy comments"),
        },
      },
      async (args) => {
        const { policyid, ...updates } = args;
        const body: Record<string, unknown> = {};

        if (updates.name !== undefined) body.name = updates.name;
        if (updates.status !== undefined) body.status = updates.status;
        if (updates.action !== undefined) body.action = updates.action;
        if (updates.comments !== undefined) body.comments = updates.comments;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const response = await client.put(
          "cmdb/firewall/policy",
          String(policyid),
          body
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated firewall policy ${policyid}: ${JSON.stringify(response.results, null, 2)}`,
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
        const response = await client.delete(
          "cmdb/firewall/policy",
          String(args.policyid)
        );
        return {
          content: [
            {
              type: "text",
              text: `Deleted firewall policy ${args.policyid}: ${JSON.stringify(response.results, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
