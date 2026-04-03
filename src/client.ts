import { Config } from "./config.js";

interface FortiGateResponse<T = unknown> {
  http_method: string;
  revision: string;
  results?: T;
  mkey?: string;
  status: string;
  http_status: number;
  vdom: string;
  path: string;
  name: string;
  serial: string;
  version: string;
  build: number;
}

export class FortiGateClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(private config: Config) {
    this.baseUrl = `${config.host}/api/v2`;
    this.headers = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * GET request to FortiGate API
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set("vdom", this.config.vdom);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FortiGateResponse<T>;

    if (data.status !== "success") {
      throw new Error(`FortiGate API returned status: ${data.status}`);
    }

    return data.results as T;
  }

  /**
   * POST request to FortiGate API (create)
   */
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set("vdom", this.config.vdom);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FortiGateResponse<T>;

    if (data.status !== "success") {
      throw new Error(`FortiGate API returned status: ${data.status}`);
    }

    return data as T;
  }

  /**
   * PUT request to FortiGate API (update)
   */
  async put<T = unknown>(
    path: string,
    mkey: string,
    body: unknown
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}/${mkey}`);
    url.searchParams.set("vdom", this.config.vdom);

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FortiGateResponse<T>;

    if (data.status !== "success") {
      throw new Error(`FortiGate API returned status: ${data.status}`);
    }

    return data as T;
  }

  /**
   * DELETE request to FortiGate API
   */
  async delete<T = unknown>(path: string, mkey: string): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}/${mkey}`);
    url.searchParams.set("vdom", this.config.vdom);

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as FortiGateResponse<T>;

    if (data.status !== "success") {
      throw new Error(`FortiGate API returned status: ${data.status}`);
    }

    return data as T;
  }
}
