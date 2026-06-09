import qs from 'qs';

import { getAccessToken } from '@/utils/auth-storage';
import {
  isSsoAuthPath,
  refreshAccessToken,
  resolveServerDomain,
} from '@/utils/auth-refresh';

type InstanceOptions<T extends string> = {
  domain?: string;
  apis: Record<T, string>;
};

type RequestOptions = {
  method?: string;
  retried?: boolean;
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

function buildRequest(
  url: string,
  data: any,
  config?: RequestOptions
): { realUrl: string; options: RequestInit } {
  const domain = resolveServerDomain();
  let realUrl = domain + url;
  const accessToken = getAccessToken();
  const method = config?.method || 'POST';
  const options: RequestInit = {
    method,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  };

  if (data) {
    if (method === 'GET') {
      realUrl = `${realUrl}?${qs.stringify(data)}`;
    } else if (
      method === 'DELETE' &&
      typeof data === 'object' &&
      data !== null &&
      'record_id' in data &&
      (data as { record_id: unknown }).record_id != null
    ) {
      realUrl = `${realUrl}/${encodeURIComponent(String((data as { record_id: string }).record_id))}`;
    } else if (
      method === 'DELETE' &&
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

  return { realUrl, options };
}

function parseErrorMessage(payload: any): string {
  const detail = payload?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(', ');
  }
  return '请求失败';
}

export function createInstance<T extends string>({ apis }: InstanceOptions<T>) {
  const internalRequest = async (
    url: string,
    data: any,
    config?: RequestOptions
  ): Promise<any> => {
    const { realUrl, options } = buildRequest(url, data, config);
    const response = await fetch(realUrl, options);
    const payload = await response.json();

    if (
      response.status === 401 &&
      !config?.retried &&
      !isSsoAuthPath(url)
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return internalRequest(url, data, { ...config, retried: true });
      }
    }

    if (!response.ok) {
      throw new Error(parseErrorMessage(payload));
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
