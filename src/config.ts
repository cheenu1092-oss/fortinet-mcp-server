export interface Config {
  host: string;
  apiKey: string;
  vdom: string;
  verifySsl: boolean;
  enableWrite: boolean;
}

export function loadConfig(): Config {
  const host = process.env.FORTIGATE_HOST || "";
  const apiKey = process.env.FORTIGATE_API_KEY || "";
  const vdom = process.env.FORTIGATE_VDOM || "root";
  const verifySsl = process.env.FORTIGATE_VERIFY_SSL !== "false";
  const enableWrite = process.env.FORTIGATE_ENABLE_WRITE === "true";

  // Parse CLI args
  const args = process.argv.slice(2);
  const config: Config = { host, apiKey, vdom, verifySsl, enableWrite };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--fortigate-host" && args[i + 1]) {
      config.host = args[++i];
    } else if (arg === "--api-key" && args[i + 1]) {
      config.apiKey = args[++i];
    } else if (arg === "--vdom" && args[i + 1]) {
      config.vdom = args[++i];
    } else if (arg === "--no-verify-ssl") {
      config.verifySsl = false;
    } else if (arg === "--enable-write") {
      config.enableWrite = true;
    }
  }

  if (!config.host) {
    throw new Error(
      "FORTIGATE_HOST is required (env var or --fortigate-host flag)"
    );
  }
  if (!config.apiKey) {
    throw new Error(
      "FORTIGATE_API_KEY is required (env var or --api-key flag)"
    );
  }

  return config;
}
