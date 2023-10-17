import querystring from "querystring";

type RequestInterceptor = (url: string, config: RequestInit) => RequestInit;
type ResponseInterceptor<T> = (response: T) => T | Promise<T>;
type FexiosRequestInit = RequestInit & {
  params?: Record<string, string | number>;
};

interface InterceptorManager<T> {
  use: (interceptor: T) => void;
}

interface FexiosConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, string | number>;
}

export class fexios {
  public interceptors: {
    request: InterceptorManager<RequestInterceptor>;
    response: InterceptorManager<ResponseInterceptor<any>>;
  } = {
    request: {
      use: this.addRequestInterceptor.bind(this),
    },
    response: {
      use: this.addResponseInterceptor.bind(this),
    },
  };

  private config: FexiosConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor<any>[] = [];

  constructor(config: FexiosConfig = {}) {
    this.config = config;
  }

  private constructUrl(
    url: string,
    params?: Record<string, string | number>
  ): string {
    const queryString = params ? querystring.stringify(params) : "";
    const delimiter = url.includes("?") ? "&" : "?";
    const finalUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url;

    return queryString ? `${finalUrl}${delimiter}${queryString}` : finalUrl;
  }

  public static create(config: FexiosConfig): fexios {
    return new fexios(config);
  }

  private addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  private addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>) {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(
    url: string,
    config: RequestInit
  ): Promise<RequestInit> {
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(url, finalConfig);
    }
    return finalConfig;
  }

  private async applyResponseInterceptors<T>(response: T): Promise<T> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  private async makeRequest<T>(
    url: string,
    config: RequestInit = {}
  ): Promise<T> {
    const mergedConfig: RequestInit = {
      ...config,
      headers: { ...this.config.headers, ...config.headers },
    };
    let finalUrl: string;

    if (this.config.baseURL) {
      finalUrl = `${this.config.baseURL}${url}`;

      if (finalUrl.startsWith(`${this.config.baseURL}${this.config.baseURL}`)) {
        finalUrl = finalUrl.substring(this.config.baseURL.length);
      }
    } else {
      finalUrl = url;
    }

    const finalConfig = await this.applyRequestInterceptors(
      finalUrl,
      mergedConfig
    );

    const response = await fetch(finalUrl, finalConfig);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return await this.applyResponseInterceptors(data);
  }

  public async get<T>(url: string, config?: FexiosRequestInit): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, { ...config, method: "GET" });
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(url: string, config?: FexiosRequestInit): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, { ...config, method: "DELETE" });
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public async head<T>(url: string, config?: FexiosRequestInit): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, { ...config, method: "HEAD" });
  }

  public async options<T>(url: string, config?: FexiosRequestInit): Promise<T> {
    const fullUrl = this.constructUrl(url, config?.params);
    return this.makeRequest<T>(fullUrl, { ...config, method: "OPTIONS" });
  }

  public static async get<T>(
    url: string,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.get<T>(url, config);
  }

  public static async put<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.put<T>(url, data, config);
  }

  public static async delete<T>(
    url: string,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.delete<T>(url, config);
  }

  public static async post<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.post<T>(url, data, config);
  }

  public static async patch<T>(
    url: string,
    data?: any,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.patch<T>(url, data, config);
  }

  public static async head<T>(
    url: string,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.head<T>(url, config);
  }

  public static async options<T>(
    url: string,
    config?: FexiosRequestInit
  ): Promise<T> {
    const instance = new fexios();
    return instance.options<T>(url, config);
  }
}
