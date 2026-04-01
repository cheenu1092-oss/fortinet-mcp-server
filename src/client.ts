import { Config } from "./config.js";

export interface FortiApiResponse<T = unknown> {
  http_method: string;
  revision: string;
  results: T;
  vdom: string;
  path: string;
  name: string;
  status: string;
  http_status: number;
  serial: string;
  version: string;
  build: number;
}

export class FortiApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private vdom: string;

  constructor(private config: Config) {
    this.baseUrl = `${config.host}/api/${config.apiVersion}`;
    this.headers = {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    this.vdom = config.vdom;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("vdom", this.vdom);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    return url.toString();
  }

  async get<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<FortiApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `FortiAPI GET ${path} failed: ${response.status} ${response.statusText}\n${text}`
      );
    }

    return response.json();
  }

  async post<T = unknown>(
    path: string,
    body: unknown,
    params?: Record<string, string>
  ): Promise<FortiApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `FortiAPI POST ${path} failed: ${response.status} ${response.statusText}\n${text}`
      );
    }

    return response.json();
  }

  async put<T = unknown>(
    path: string,
    body: unknown,
    params?: Record<string, string>
  ): Promise<FortiApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `FortiAPI PUT ${path} failed: ${response.status} ${response.statusText}\n${text}`
      );
    }

    return response.json();
  }

  async delete<T = unknown>(
    path: string,
    params?: Record<string, string>
  ): Promise<FortiApiResponse<T>> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `FortiAPI DELETE ${path} failed: ${response.status} ${response.statusText}\n${text}`
      );
    }

    return response.json();
  }
}
