import { redirect } from 'next/navigation';

/** 原跟踪事件路由已并入「管理」，保留路径以免书签失效 */
export default function EnergyFutureEventsLegacyRedirect() {
  redirect('/manage');
}
