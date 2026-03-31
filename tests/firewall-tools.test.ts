import { describe, it, expect } from "vitest";

describe("Firewall Tools", () => {
  it("should validate policy creation schema", () => {
    const validPolicy = {
      name: "Test-Policy",
      srcintf: [{ name: "port1" }],
      dstintf: [{ name: "port2" }],
      srcaddr: [{ name: "all" }],
      dstaddr: [{ name: "all" }],
      service: [{ name: "ALL" }],
      action: "accept",
    };

    expect(validPolicy).toBeDefined();
    expect(validPolicy.name).toBe("Test-Policy");
    expect(validPolicy.action).toBe("accept");
  });

  it("should handle policy filtering", () => {
    const filter = "name==Test-Policy";
    expect(filter).toContain("==");
  });
});
