import https from "https";

export interface FortiAPIResponse<T = unknown> {
  http_method: string;
  revision: string;
  results: T;
  vdom: string;
  path: string;
  name: string;
  action: string;
  status: string;
  http_status: number;
  serial: string;
  version: string;
  build: number;
}

export class FortiGateClient {
  private baseUrl: string;
  private apiKey: string;
  private vdom: string;
  private agent: https.Agent;

  constructor(host: string, apiKey: string, vdom: string, verifySSL: boolean) {
    this.baseUrl = `${host}/api/v2`;
    this.apiKey = apiKey;
    this.vdom = vdom;
    this.agent = new https.Agent({
      rejectUnauthorized: verifySSL,
    });
  }

  /**
   * Generic GET request to FortiGate REST API
   */
  async get<T = unknown>(
    path: string,
    params: Record<string, string> = {}
  ): Promise<FortiAPIResponse<T>> {
    const queryParams = new URLSearchParams({
      vdom: this.vdom,
      ...params,
    });

    const url = `${this.baseUrl}/${path}?${queryParams}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      // @ts-expect-error - Node.js fetch supports agent
      agent: this.agent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * POST request (create)
   */
  async post<T = unknown>(
    path: string,
    body: Record<string, unknown>
  ): Promise<FortiAPIResponse<T>> {
    const url = `${this.baseUrl}/${path}?vdom=${this.vdom}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // @ts-expect-error - Node.js fetch supports agent
      agent: this.agent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * PUT request (update)
   */
  async put<T = unknown>(
    path: string,
    mkey: string,
    body: Record<string, unknown>
  ): Promise<FortiAPIResponse<T>> {
    const url = `${this.baseUrl}/${path}/${mkey}?vdom=${this.vdom}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // @ts-expect-error - Node.js fetch supports agent
      agent: this.agent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    path: string,
    mkey: string
  ): Promise<FortiAPIResponse<T>> {
    const url = `${this.baseUrl}/${path}/${mkey}?vdom=${this.vdom}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      // @ts-expect-error - Node.js fetch supports agent
      agent: this.agent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `FortiGate API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }
}
