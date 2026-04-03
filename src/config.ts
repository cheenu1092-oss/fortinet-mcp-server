export interface Config {
  host: string;
  apiKey: string;
  vdom: string;
  verifySSL: boolean;
  enableWrite: boolean;
}

export function loadConfig(): Config {
  const host = process.env.FORTINET_HOST;
  const apiKey = process.env.FORTINET_API_KEY;
  const vdom = process.env.FORTINET_VDOM || "root";
  const verifySSL = process.env.FORTINET_VERIFY_SSL !== "false";

  // Check for --enable-write flag
  const enableWrite = process.argv.includes("--enable-write");

  if (!host || !apiKey) {
    throw new Error(
      "Missing required environment variables: FORTINET_HOST, FORTINET_API_KEY"
    );
  }

  return {
    host: host.replace(/\/$/, ""), // Remove trailing slash
    apiKey,
    vdom,
    verifySSL,
    enableWrite,
  };
}
