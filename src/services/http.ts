import qs from 'qs';

type InstanceOptions<T extends string> = {
  domain?: string;
  apis: Record<T, string>;
  withAuth?: boolean; // 是否需要认证
};

type RequestOptions = {
  method: string;
  headers?: Record<string, string>;
  withAuth?: boolean;
};

interface IServiceRequestFn<T = any> {
  (data?: any, config?: any): Promise<T>;
}

// Token 管理
export const TokenManager = {
  // 存储 token
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },

  // 获取 token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  // 移除 token
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  },

  // 检查是否有有效 token
  hasValidToken: (): boolean => {
    const token = TokenManager.getToken();
    if (!token) return false;

    try {
      // 解析 JWT token 的 payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // 检查是否过期
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
};

// 认证失效处理
const handleAuthError = () => {
  TokenManager.removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

function parseServiceUrl(value: string) {
  let method;
  let url;
  if (value.startsWith('GET')) {
    method = 'GET';
    url = value.replace('GET', '').trim();
  } else {
    method = 'POST';
    url = value.trim();
  }
  return { method, url };
}

export function createInstance<T extends string>({
  apis,
  withAuth = true,
}: InstanceOptions<T>) {
  const internalRequest = async (
    url: string,
    data: any,
    config?: RequestOptions
  ) => {
    let domain = process.env.NEXT_PUBLIC_SERVER as string;
    if (typeof window !== 'undefined') {
      domain = (window as any)?.SERVER_HOST || domain;
    }
    let realUrl = domain + url;

    const options: any = {
      method: config?.method || 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    };

    // 添加认证 token
    const needsAuth = config?.withAuth !== false && withAuth;
    if (needsAuth) {
      const token = TokenManager.getToken();
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (data) {
      if (options.method === 'GET') {
        realUrl = realUrl + '?' + qs.stringify(data);
      } else if (url === '/api/sso/token') { // login 特殊处理
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        options.body = qs.stringify(data);
      } else {
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(realUrl, options);

      // 处理 401 认证失效
      if (response.status === 401 && needsAuth) {
        handleAuthError();
        throw new Error('认证失效，请重新登录');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  };

  const serviceInstance = {} as Record<T, IServiceRequestFn>;

  Object.keys(apis).forEach((apiName) => {
    serviceInstance[apiName as T] = function serviceWrapFn(
      data: any,
      config?: any
    ) {
      const { url, method } = parseServiceUrl(apis[apiName as T]);
      return internalRequest(url, data, {
        method,
        ...config,
      });
    };
  });

  return serviceInstance;
}
