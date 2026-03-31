import https from "https";

export class FortiGateError extends Error {
  constructor(
    public statusCode: number,
    public method: string,
    public path: string,
    message: string
  ) {
    super(`FortiGate API Error [${statusCode}] ${method} ${path}: ${message}`);
    this.name = "FortiGateError";
  }
}

export interface FortiClientConfig {
  host: string;
  apiKey: string;
  vdom?: string;
  verifySsl?: boolean;
}

export class FortiClient {
  private host: string;
  private apiKey: string;
  private vdom: string;
  private agent: https.Agent;

  constructor(config: FortiClientConfig) {
    this.host = config.host.replace(/\/+$/, ""); // Remove trailing slashes
    this.apiKey = config.apiKey;
    this.vdom = config.vdom || "root";
    
    // Create HTTPS agent with optional SSL verification
    this.agent = new https.Agent({
      rejectUnauthorized: config.verifySsl !== false,
    });
  }

  /**
   * Generic HTTP request method
   */
  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(path, this.host);
    
    // Add VDOM to query params
    url.searchParams.set("vdom", this.vdom);
    
    // Add additional query params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const options: https.RequestOptions = {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      agent: this.agent,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = "";
        
        res.on("data", (chunk) => {
          data += chunk;
        });
        
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            
            // FortiOS API response structure: { results: [...], status: "success", ... }
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              // Success
              if (parsed.results !== undefined) {
                resolve(parsed.results as T);
              } else {
                resolve(parsed as T);
              }
            } else {
              // Error
              const errorMsg = parsed.error || parsed.message || "Unknown error";
              reject(
                new FortiGateError(
                  res.statusCode || 500,
                  method,
                  path,
                  errorMsg
                )
              );
            }
          } catch (err) {
            reject(new Error(`Failed to parse FortiGate API response: ${err}`));
          }
        });
      });

      req.on("error", (err) => {
        reject(new Error(`HTTP request failed: ${err.message}`));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * GET request (single object or list)
   */
  async get<T>(
    path: string,
    id?: string,
    params?: Record<string, string>
  ): Promise<T> {
    const fullPath = id ? `${path}/${id}` : path;
    return this.request<T>("GET", fullPath, params);
  }

  /**
   * GET request with automatic pagination (for lists)
   */
  async getAll<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T[]> {
    // FortiOS uses 'start' and 'count' for pagination
    // For simplicity, fetch all at once (can optimize with pagination loop later)
    const allParams = { ...params };
    return this.request<T[]>("GET", path, allParams);
  }

  /**
   * POST request (create)
   */
  async post<T>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>("POST", path, undefined, body);
  }

  /**
   * PUT request (update)
   */
  async put<T>(
    path: string,
    id: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const fullPath = `${path}/${id}`;
    return this.request<T>("PUT", fullPath, undefined, body);
  }

  /**
   * DELETE request
   */
  async delete(path: string, id: string): Promise<{ success: boolean }> {
    const fullPath = `${path}/${id}`;
    await this.request("DELETE", fullPath);
    return { success: true };
  }
}
