import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiApiClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerFirewallTools(
  server: McpServer,
  client: FortiApiClient,
  config: Config
): void {
  // list_firewall_policies
  server.registerTool(
    "list_firewall_policies",
    {
      description: "List firewall policies with optional filters",
      inputSchema: {
        policyid: z.number().optional().describe("Filter by policy ID"),
        name: z.string().optional().describe("Filter by policy name"),
        srcintf: z.string().optional().describe("Filter by source interface"),
        dstintf: z.string().optional().describe("Filter by destination interface"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      
      if (args.policyid !== undefined) params["policyid"] = String(args.policyid);
      if (args.name) params["name"] = args.name;
      if (args.srcintf) params["srcintf"] = args.srcintf;
      if (args.dstintf) params["dstintf"] = args.dstintf;

      const response = await client.get("/cmdb/firewall/policy", params);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
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
      const response = await client.get(
        `/cmdb/firewall/policy/${args.policyid}`
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
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
          srcintf: z.array(z.object({ name: z.string() })).describe("Source interfaces"),
          dstintf: z.array(z.object({ name: z.string() })).describe("Destination interfaces"),
          srcaddr: z.array(z.object({ name: z.string() })).describe("Source addresses"),
          dstaddr: z.array(z.object({ name: z.string() })).describe("Destination addresses"),
          service: z.array(z.object({ name: z.string() })).describe("Services"),
          action: z.enum(["accept", "deny", "ipsec"]).describe("Policy action"),
          schedule: z.string().optional().describe("Schedule name (default: always)"),
          nat: z.enum(["enable", "disable"]).optional().describe("NAT enable/disable"),
          comments: z.string().optional().describe("Policy comments"),
          status: z.enum(["enable", "disable"]).optional().describe("Policy status"),
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
          schedule: args.schedule ?? "always",
          status: args.status ?? "enable",
        };

        if (args.nat) body.nat = args.nat;
        if (args.comments) body.comments = args.comments;

        const response = await client.post("/cmdb/firewall/policy", body);
        return {
          content: [
            {
              type: "text",
              text: `Created firewall policy: ${JSON.stringify(response, null, 2)}`,
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
          srcintf: z.array(z.object({ name: z.string() })).optional().describe("New source interfaces"),
          dstintf: z.array(z.object({ name: z.string() })).optional().describe("New destination interfaces"),
          srcaddr: z.array(z.object({ name: z.string() })).optional().describe("New source addresses"),
          dstaddr: z.array(z.object({ name: z.string() })).optional().describe("New destination addresses"),
          service: z.array(z.object({ name: z.string() })).optional().describe("New services"),
          action: z.enum(["accept", "deny", "ipsec"]).optional().describe("New policy action"),
          nat: z.enum(["enable", "disable"]).optional().describe("NAT enable/disable"),
          comments: z.string().optional().describe("New policy comments"),
          status: z.enum(["enable", "disable"]).optional().describe("New policy status"),
        },
      },
      async (args) => {
        const { policyid, ...updates } = args;
        
        if (Object.keys(updates).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const response = await client.put(
          `/cmdb/firewall/policy/${policyid}`,
          updates
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated firewall policy ${policyid}: ${JSON.stringify(response, null, 2)}`,
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
          `/cmdb/firewall/policy/${args.policyid}`
        );
        return {
          content: [
            {
              type: "text",
              text: `Deleted firewall policy ${args.policyid}: ${JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      }
    );

    // move_firewall_policy
    server.registerTool(
      "move_firewall_policy",
      {
        description: "Move a firewall policy to a new position",
        inputSchema: {
          policyid: z.number().describe("Policy ID to move"),
          action: z.enum(["before", "after"]).describe("Move before or after"),
          target: z.number().describe("Target policy ID"),
        },
      },
      async (args) => {
        const response = await client.put(
          `/cmdb/firewall/policy/${args.policyid}`,
          {},
          {
            action: "move",
            [args.action]: String(args.target),
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Moved policy ${args.policyid} ${args.action} ${args.target}: ${JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
