import { useAsyncEffect, useSetState } from 'ahooks';
import { useEffect, useState } from 'react';
import services from '@/services';

export default function useSchemas() {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useSetState({
    data: [],
    current: '',
  });
  const [schemas, setSchemas] = useSetState({
    data: [],
    current: '',
  });

  const [datas, setDatas] = useState<Record<string, any>[]>([]);

  const updateDatas = async (provider: string, schema: string) => {
    const data = await services.getQueryData({ provider, schema });
    setDatas(data);
  };

  const updateSchemas = async (provider: string) => {
    const data = await services.getSchemas({ provider });
    const currentSchema = data?.[0];
    setSchemas({
      data: data,
      current: currentSchema,
    });
    updateDatas(provider, currentSchema);
  };

  useAsyncEffect(async () => {
    setLoading(true);
    const data = await services.getProviders();
    const currentProvider = data?.[0];
    updateSchemas(currentProvider);
    setProviders({
      data: data,
      current: currentProvider,
    });
    setLoading(false);
  }, []);

  return {
    loading,
    providers,
    schemas,
    datas,
    changeProvider: async (provider: string) => {
      setLoading(true);
      setProviders({ current: provider });
      await updateSchemas(provider);
      setLoading(false);
    },
    changeSchema: (schema: string) => {
      setLoading(true);
      setSchemas({ current: schema });
      updateDatas(providers.current, schema);
      setLoading(false);
    },
  };
}
