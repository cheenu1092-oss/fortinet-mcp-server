export interface Config {
  host: string;
  apiKey: string;
  vdom: string; // Virtual Domain (default: "root")
  verifySSL: boolean;
  enableWrite: boolean;
}

export function loadConfig(): Config {
  const host = process.env.FORTINET_HOST;
  const apiKey = process.env.FORTINET_API_KEY;

  if (!host) {
    throw new Error("FORTINET_HOST environment variable is required");
  }
  if (!apiKey) {
    throw new Error("FORTINET_API_KEY environment variable is required");
  }

  return {
    host: host.replace(/\/$/, ""), // Remove trailing slash
    apiKey,
    vdom: process.env.FORTINET_VDOM || "root",
    verifySSL: process.env.FORTINET_VERIFY_SSL !== "false",
    enableWrite: process.argv.includes("--enable-write"),
  };
}
