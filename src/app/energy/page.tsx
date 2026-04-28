import { redirect } from 'next/navigation';

/** 原「能量」入口已并入「管理」，保留路径以免书签失效 */
export default function EnergyLegacyRedirect() {
  redirect('/manage');
}
