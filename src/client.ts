import { Config } from "./config.js";

export class FortiGateError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "FortiGateError";
  }
}

export interface FortiGateResponse<T = unknown> {
  http_status: number;
  results?: T[];
  result?: T;
  vdom: string;
  path: string;
  name: string;
  status: string;
  serial: string;
  version: string;
  build: number;
}

export class FortiGateClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(private config: Config) {
    this.baseUrl = `${config.host}/api/v2`;
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
    };
    this.timeout = config.timeout || 30000;
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: unknown
  ): Promise<T> {
    // Build URL with query params
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);
    
    // Add VDOM parameter if specified
    if (this.config.vdom) {
      url.searchParams.set("vdom", this.config.vdom);
    }

    // Add additional params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const options: RequestInit = {
      method,
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    // Add body for POST/PUT
    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    // Make request
    const response = await fetch(url.toString(), options);

    // Handle response
    if (!response.ok) {
      let errorMessage = `FortiGate API error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.results && errorData.results[0]?.message) {
          errorMessage = errorData.results[0].message;
        }
      } catch {
        errorMessage = await response.text();
      }
      throw new FortiGateError(errorMessage, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    const data: FortiGateResponse<T> = await response.json();

    // Check API-level status
    if (data.status !== "success") {
      throw new FortiGateError(
        `FortiGate API returned non-success status: ${data.status}`,
        data.http_status,
        data
      );
    }

    // Return results or result depending on response structure
    if (data.results !== undefined) {
      return data.results as T;
    } else if (data.result !== undefined) {
      return data.result as T;
    }

    return data as T;
  }

  /**
   * GET request to read object(s)
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("GET", path, params);
  }

  /**
   * POST request to create object
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, undefined, body);
  }

  /**
   * PUT request to update object
   */
  async put<T = unknown>(
    path: string,
    body: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("PUT", path, params, body);
  }

  /**
   * DELETE request to delete object
   */
  async delete<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("DELETE", path, params);
  }

  /**
   * List all objects of a given type (handles pagination if needed)
   */
  async getAll<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T[]> {
    // FortiGate API returns all results by default (no pagination needed for most endpoints)
    const results = await this.get<T[]>(path, params);
    return results || [];
  }
}
