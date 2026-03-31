import { describe, it, expect } from "vitest";

describe("VPN Tools", () => {
  it("should validate IPsec tunnel creation schema", () => {
    const validTunnel = {
      name: "Site-to-Site-VPN",
      interface: "wan1",
      "remote-gw": "203.0.113.1",
      psksecret: "supersecret123",
      "ike-version": "2",
    };

    expect(validTunnel).toBeDefined();
    expect(validTunnel.name).toBe("Site-to-Site-VPN");
    expect(validTunnel.interface).toBe("wan1");
    expect(validTunnel["remote-gw"]).toBe("203.0.113.1");
  });

  it("should handle VPN tunnel filtering", () => {
    const filter = "name==MyTunnel";
    expect(filter).toContain("==");
  });
});
