export interface Config {
  host: string;
  token: string;
  vdom?: string;
  verifySsl: boolean;
  timeout: number;
  enableWrite: boolean;
}

export function loadConfig(): Config {
  const host = process.env.FORTIGATE_HOST;
  const token = process.env.FORTIGATE_TOKEN;

  if (!host) {
    throw new Error("FORTIGATE_HOST environment variable is required");
  }
  if (!token) {
    throw new Error("FORTIGATE_TOKEN environment variable is required");
  }

  return {
    host: host.replace(/\/$/, ""), // Remove trailing slash
    token,
    vdom: process.env.FORTIGATE_VDOM || "root",
    verifySsl: process.env.FORTIGATE_VERIFY_SSL !== "false",
    timeout: parseInt(process.env.FORTIGATE_TIMEOUT || "30000", 10),
    enableWrite: process.argv.includes("--enable-write"),
  };
}
