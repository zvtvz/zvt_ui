import qs from 'qs';

import { getAccessToken } from '@/utils/auth-storage';

type InstanceOptions<T extends string> = {
  domain?: string;
  apis: Record<T, string>;
};

type RequestOptions = {
  method: string;
};

interface IServiceRequestFn<T = any> {
  (data?: any, config?: any): Promise<T>;
}

function parseServiceUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('GET ')) {
    return { method: 'GET', url: trimmed.slice(4).trim() };
  }
  if (trimmed.startsWith('DELETE ')) {
    return { method: 'DELETE', url: trimmed.slice(7).trim() };
  }
  return { method: 'POST', url: trimmed };
}

export function createInstance<T extends string>({ apis }: InstanceOptions<T>) {
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
    const accessToken = getAccessToken();
    const options: any = {
      method: config?.method || 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };

    if (data) {
      if (options.method === 'GET') {
        realUrl = realUrl + '?' + qs.stringify(data);
      } else if (
        options.method === 'DELETE' &&
        typeof data === 'object' &&
        data !== null &&
        'record_id' in data &&
        (data as { record_id: unknown }).record_id != null
      ) {
        realUrl = `${realUrl}/${encodeURIComponent(String((data as { record_id: string }).record_id))}`;
      } else if (
        options.method === 'DELETE' &&
        typeof data === 'object' &&
        data !== null &&
        'name' in data &&
        (data as { name: unknown }).name != null
      ) {
        realUrl = `${realUrl}/${encodeURIComponent(String((data as { name: string }).name))}`;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(realUrl, options);
    const payload = await response.json();
    if (!response.ok) {
      const detail = payload?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item?.msg || String(item)).join(', ')
            : '请求失败';
      throw new Error(message);
    }
    return payload;
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
