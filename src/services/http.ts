import qs from 'qs';

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
    const options: any = {
      method: config?.method || 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      if (options.method === 'GET') {
        realUrl = realUrl + '?' + qs.stringify(data);
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(realUrl, options);
    return response.json();
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
