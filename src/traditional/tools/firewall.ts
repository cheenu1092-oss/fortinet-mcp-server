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
      description: "List firewall policies with optional filters",
      inputSchema: {
        name: z.string().optional().describe("Filter by policy name"),
        srcintf: z.string().optional().describe("Filter by source interface"),
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
      let results = await client.get<unknown[]>("cmdb/firewall/policy");

      // Apply filters
      if (args.name) {
        results = results.filter((p: any) =>
          p.name?.toLowerCase().includes(args.name!.toLowerCase())
        );
      }
      if (args.srcintf) {
        results = results.filter((p: any) =>
          p.srcintf?.some((i: any) => i.name === args.srcintf)
        );
      }
      if (args.dstintf) {
        results = results.filter((p: any) =>
          p.dstintf?.some((i: any) => i.name === args.dstintf)
        );
      }
      if (args.status) {
        results = results.filter((p: any) => p.status === args.status);
      }

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
        policyid: z.string().describe("Policy ID (mkey)"),
      },
    },
    async (args) => {
      const result = await client.get(
        `cmdb/firewall/policy/${args.policyid}`
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
          service: z
            .array(z.object({ name: z.string() }))
            .describe("Services"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .describe("Policy action"),
          schedule: z.string().optional().describe("Schedule name"),
          status: z
            .enum(["enable", "disable"])
            .optional()
            .describe("Policy status (default: enable)"),
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
          service: args.service,
          action: args.action,
          schedule: args.schedule || "always",
          status: args.status || "enable",
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
          policyid: z.string().describe("Policy ID (mkey)"),
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
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {};

        if (args.name !== undefined) body.name = args.name;
        if (args.status !== undefined) body.status = args.status;
        if (args.action !== undefined) body.action = args.action;
        if (args.comments !== undefined) body.comments = args.comments;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          "cmdb/firewall/policy",
          args.policyid,
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
          policyid: z.string().describe("Policy ID (mkey)"),
        },
      },
      async (args) => {
        const result = await client.delete(
          "cmdb/firewall/policy",
          args.policyid
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
