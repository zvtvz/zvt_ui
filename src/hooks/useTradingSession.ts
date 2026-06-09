import { useEffect, useState } from 'react';

import { isAshareTradingSession } from '@/utils/trading-session';

/** 跟踪是否处于 A 股交易时段，便于开关轮询。 */
export function useTradingSession(checkIntervalMs = 30_000) {
  const [isTradingSession, setIsTradingSession] = useState(() =>
    isAshareTradingSession()
  );

  useEffect(() => {
    const update = () => setIsTradingSession(isAshareTradingSession());
    update();
    const intervalId = window.setInterval(update, checkIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [checkIntervalMs]);

  return isTradingSession;
}
