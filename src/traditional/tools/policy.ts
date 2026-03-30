import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerPolicyTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_firewall_policies
  server.registerTool(
    "list_firewall_policies",
    {
      description: "List IPv4 firewall policies",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., srcintf==port1, action==accept)"),
        format: z
          .enum(["name", "id"])
          .optional()
          .describe("Response format (default: full object)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params.filter = args.filter;
      if (args.format) params.format = args.format;

      const results = await client.get("cmdb/firewall/policy", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // get_firewall_policy
  server.registerTool(
    "get_firewall_policy",
    {
      description: "Get a specific firewall policy by ID",
      inputSchema: {
        policyid: z.number().describe("Policy ID"),
      },
    },
    async (args) => {
      const result = await client.get(`cmdb/firewall/policy/${args.policyid}`);
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
            .describe("Source interfaces"),
          dstintf: z
            .array(z.object({ name: z.string() }))
            .describe("Destination interfaces"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Source addresses"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .describe("Destination addresses"),
          action: z.enum(["accept", "deny"]).describe("Policy action"),
          schedule: z
            .string()
            .optional()
            .default("always")
            .describe("Schedule name"),
          service: z
            .array(z.object({ name: z.string() }))
            .describe("Services"),
          nat: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Enable NAT"),
          comments: z.string().optional().describe("Policy comments"),
        },
      },
      async (args) => {
        const body = {
          name: args.name,
          srcintf: args.srcintf,
          dstintf: args.dstintf,
          srcaddr: args.srcaddr,
          dstaddr: args.dstaddr,
          action: args.action,
          schedule: args.schedule || "always",
          service: args.service,
          nat: args.nat,
          comments: args.comments,
        };

        const result = await client.post("cmdb/firewall/policy", body);
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
          srcintf: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New source interfaces"),
          dstintf: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New destination interfaces"),
          srcaddr: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New source addresses"),
          dstaddr: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New destination addresses"),
          action: z
            .enum(["accept", "deny"])
            .optional()
            .describe("New policy action"),
          service: z
            .array(z.object({ name: z.string() }))
            .optional()
            .describe("New services"),
          nat: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Enable/disable NAT"),
          comments: z.string().optional().describe("New comments"),
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Enable/disable policy"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {};

        if (args.name !== undefined) body.name = args.name;
        if (args.srcintf !== undefined) body.srcintf = args.srcintf;
        if (args.dstintf !== undefined) body.dstintf = args.dstintf;
        if (args.srcaddr !== undefined) body.srcaddr = args.srcaddr;
        if (args.dstaddr !== undefined) body.dstaddr = args.dstaddr;
        if (args.action !== undefined) body.action = args.action;
        if (args.service !== undefined) body.service = args.service;
        if (args.nat !== undefined) body.nat = args.nat;
        if (args.comments !== undefined) body.comments = args.comments;
        if (args.status !== undefined) body.status = args.status;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          `cmdb/firewall/policy/${args.policyid}`,
          body
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
          `cmdb/firewall/policy/${args.policyid}`
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
