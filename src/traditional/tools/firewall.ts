import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerFirewallTools(
  server: McpServer,
  client: FortiClient,
  config: Config
): void {
  // list_firewall_policies
  server.registerTool(
    "list_firewall_policies",
    {
      description: "List all firewall security policies",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Filter by policy name (regex supported)"),
        srcaddr: z
          .string()
          .optional()
          .describe("Filter by source address object"),
        dstaddr: z
          .string()
          .optional()
          .describe("Filter by destination address object"),
        service: z.string().optional().describe("Filter by service object"),
        action: z
          .enum(["accept", "deny", "ipsec"])
          .optional()
          .describe("Filter by policy action"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      
      if (args.name) params["name~"] = args.name;
      if (args.srcaddr) params["srcaddr"] = args.srcaddr;
      if (args.dstaddr) params["dstaddr"] = args.dstaddr;
      if (args.service) params["service"] = args.service;
      if (args.action) params["action"] = args.action;

      const results = await client.getAll(
        "/api/v2/cmdb/firewall/policy",
        params
      );
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
        policyid: z.string().describe("Policy ID"),
      },
    },
    async (args) => {
      const result = await client.get(
        "/api/v2/cmdb/firewall/policy",
        args.policyid
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
        description: "Create a new firewall security policy",
        inputSchema: {
          name: z.string().describe("Policy name"),
          srcintf: z
            .array(z.string())
            .describe("Source interface(s) (array of interface names)"),
          dstintf: z
            .array(z.string())
            .describe("Destination interface(s) (array of interface names)"),
          srcaddr: z
            .array(z.string())
            .describe("Source address object(s) (array of object names)"),
          dstaddr: z
            .array(z.string())
            .describe("Destination address object(s) (array of object names)"),
          service: z
            .array(z.string())
            .describe("Service object(s) (array of service names)"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .describe("Policy action"),
          nat: z
            .boolean()
            .optional()
            .describe("Enable NAT (default: false)"),
          schedule: z
            .string()
            .optional()
            .describe("Schedule object name (default: always)"),
          comments: z.string().optional().describe("Policy comments"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          srcintf: args.srcintf.map((intf) => ({ name: intf })),
          dstintf: args.dstintf.map((intf) => ({ name: intf })),
          srcaddr: args.srcaddr.map((addr) => ({ name: addr })),
          dstaddr: args.dstaddr.map((addr) => ({ name: addr })),
          service: args.service.map((svc) => ({ name: svc })),
          action: args.action,
          status: "enable",
        };

        if (args.nat !== undefined) body.nat = args.nat ? "enable" : "disable";
        if (args.schedule) body.schedule = args.schedule;
        if (args.comments) body.comments = args.comments;

        const result = await client.post("/api/v2/cmdb/firewall/policy", body);
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
          policyid: z.string().describe("Policy ID to update"),
          name: z.string().optional().describe("New policy name"),
          srcintf: z
            .array(z.string())
            .optional()
            .describe("New source interface(s)"),
          dstintf: z
            .array(z.string())
            .optional()
            .describe("New destination interface(s)"),
          srcaddr: z
            .array(z.string())
            .optional()
            .describe("New source address object(s)"),
          dstaddr: z
            .array(z.string())
            .optional()
            .describe("New destination address object(s)"),
          service: z
            .array(z.string())
            .optional()
            .describe("New service object(s)"),
          action: z
            .enum(["accept", "deny", "ipsec"])
            .optional()
            .describe("New policy action"),
          nat: z.boolean().optional().describe("Enable/disable NAT"),
          comments: z.string().optional().describe("New comments"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {};

        if (args.name !== undefined) body.name = args.name;
        if (args.srcintf !== undefined)
          body.srcintf = args.srcintf.map((intf) => ({ name: intf }));
        if (args.dstintf !== undefined)
          body.dstintf = args.dstintf.map((intf) => ({ name: intf }));
        if (args.srcaddr !== undefined)
          body.srcaddr = args.srcaddr.map((addr) => ({ name: addr }));
        if (args.dstaddr !== undefined)
          body.dstaddr = args.dstaddr.map((addr) => ({ name: addr }));
        if (args.service !== undefined)
          body.service = args.service.map((svc) => ({ name: svc }));
        if (args.action !== undefined) body.action = args.action;
        if (args.nat !== undefined) body.nat = args.nat ? "enable" : "disable";
        if (args.comments !== undefined) body.comments = args.comments;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          "/api/v2/cmdb/firewall/policy",
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
          policyid: z.string().describe("Policy ID to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(
          "/api/v2/cmdb/firewall/policy",
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
