export interface Config {
  host: string;
  apiVersion: string;
  apiKey: string;
  verifySsl: boolean;
  vdom: string; // Virtual Domain (default: root)
  enableWrite: boolean;
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Required environment variable ${name} is not set`);
  return val;
}

export function loadConfig(): Config {
  const verifySsl = process.env["FORTINET_VERIFY_SSL"] !== "false";

  // Allow self-signed certs when SSL verification is disabled
  if (!verifySsl) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  }

  return {
    host: requireEnv("FORTINET_HOST").replace(/\/$/, ""),
    apiVersion: process.env["FORTINET_API_VERSION"] ?? "v2",
    apiKey: requireEnv("FORTINET_API_KEY"),
    verifySsl,
    vdom: process.env["FORTINET_VDOM"] ?? "root",
    enableWrite: process.argv.includes("--enable-write"),
  };
}
