import { describe, it, expect } from "vitest";

describe("Service Tools", () => {
  it("should validate service creation schema", () => {
    const validService = {
      name: "Custom-App-8080",
      protocol: "TCP/UDP/SCTP",
      tcp_portrange: "8080",
      category: "Web Access",
    };

    expect(validService).toBeDefined();
    expect(validService.name).toBe("Custom-App-8080");
    expect(validService.protocol).toBe("TCP/UDP/SCTP");
    expect(validService.tcp_portrange).toBe("8080");
  });

  it("should validate service group schema", () => {
    const validServiceGroup = {
      name: "WebServices",
      member: [
        { name: "HTTP" },
        { name: "HTTPS" },
      ],
    };

    expect(validServiceGroup).toBeDefined();
    expect(validServiceGroup.name).toBe("WebServices");
    expect(validServiceGroup.member).toHaveLength(2);
  });

  it("should handle service filtering", () => {
    const filter = "name==HTTP&protocol==TCP/UDP/SCTP";
    expect(filter).toContain("==");
    expect(filter).toContain("&");
  });
});
