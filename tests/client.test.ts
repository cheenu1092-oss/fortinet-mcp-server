import { describe, it, expect, beforeEach, vi } from "vitest";
import { FortiGateClient, FortiGateError } from "../src/client.js";
import { Config } from "../src/config.js";

// Mock fetch globally
global.fetch = vi.fn();

const mockConfig: Config = {
  host: "https://firewall.example.com",
  apiToken: "test-token-123",
  vdom: "root",
  verifySsl: true,
  enableWrite: false,
};

describe("FortiGateClient", () => {
  let client: FortiGateClient;

  beforeEach(() => {
    client = new FortiGateClient(mockConfig);
    vi.clearAllMocks();
  });

  describe("request", () => {
    it("should make a GET request successfully", async () => {
      const mockResponse = {
        status: "success",
        results: [{ name: "policy1" }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.get("cmdb/firewall/policy");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/cmdb/firewall/policy"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token-123",
          }),
        })
      );
      expect(result).toEqual(mockResponse.results);
    });

    it("should handle POST requests with body", async () => {
      const mockResponse = {
        status: "success",
        results: { policyid: 1 },
      };
      const postBody = { name: "test-policy" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.post("cmdb/firewall/policy", postBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v2/cmdb/firewall/policy"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postBody),
        })
      );
      expect(result).toEqual(mockResponse.results);
    });

    it("should handle PUT requests", async () => {
      const mockResponse = {
        status: "success",
        results: { policyid: 1 },
      };
      const putBody = { comments: "Updated policy" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.put("cmdb/firewall/policy/1", putBody);

      expect(result).toEqual(mockResponse.results);
    });

    it("should handle DELETE requests", async () => {
      const mockResponse = {
        status: "success",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await client.delete("cmdb/firewall/policy/1");

      expect(result).toBeDefined();
    });

    it("should handle 204 No Content responses", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: async () => "",
      });

      const result = await client.delete("cmdb/firewall/policy/1");

      expect(result).toBeUndefined();
    });

    it("should throw FortiGateError on failed requests", async () => {
      const errorResponse = {
        status: "error",
        error: "Policy not found",
        cli_error: "entry not found",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify(errorResponse),
      });

      await expect(client.get("cmdb/firewall/policy/999")).rejects.toThrow(
        FortiGateError
      );
    });

    it("should add vdom parameter to all requests", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: "success", results: [] }),
      });

      await client.get("cmdb/firewall/policy");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("vdom=root"),
        expect.any(Object)
      );
    });
  });
});
