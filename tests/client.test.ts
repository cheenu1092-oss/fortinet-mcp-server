import { describe, it, expect, beforeEach, vi } from "vitest";
import { FortiGateClient } from "../src/client";

// Mock global fetch
global.fetch = vi.fn();

describe("FortiGateClient", () => {
  let client: FortiGateClient;

  beforeEach(() => {
    client = new FortiGateClient(
      "https://fortigate.example.com",
      "test-api-key",
      "root",
      true
    );
    vi.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should make a GET request with correct headers and URL", async () => {
      const mockResponse = {
        http_status: 200,
        results: [{ name: "test-policy", policyid: 1 }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.get("cmdb/firewall/policy");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("cmdb/firewall/policy"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it("should include query parameters in GET request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await client.get("cmdb/firewall/policy", { filter: "name==test" });

      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain("filter=name%3D%3Dtest");
      expect(callUrl).toContain("vdom=root");
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with body", async () => {
      const mockResponse = {
        http_status: 200,
        results: { mkey: "new-address" },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const body = {
        name: "test-address",
        type: "ipmask",
        subnet: "10.0.0.0/8",
      };

      const result = await client.post("cmdb/firewall/address", body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("cmdb/firewall/address"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe("PUT requests", () => {
    it("should make a PUT request with mkey and body", async () => {
      const mockResponse = {
        http_status: 200,
        results: { mkey: "1" },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const body = { status: "disable" };

      await client.put("cmdb/firewall/policy", "1", body);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("cmdb/firewall/policy/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe("DELETE requests", () => {
    it("should make a DELETE request with mkey", async () => {
      const mockResponse = {
        http_status: 200,
        results: {},
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.delete("cmdb/firewall/policy", "1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("cmdb/firewall/policy/1"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should throw on HTTP errors", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Resource not found",
      });

      await expect(client.get("cmdb/firewall/policy/999")).rejects.toThrow(
        "FortiGate API error: 404 Not Found"
      );
    });
  });
});
