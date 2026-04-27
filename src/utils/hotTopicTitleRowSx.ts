import type { SxProps } from '@mui/joy/styles/types';

import type { StockHotTopicItem } from '@/interfaces';

const titleRowBase: SxProps = {
  px: 1,
  py: 0.75,
  borderRadius: 'sm',
};

/**
 * 仅标题行（排名+标题）背景：带 `main_tag` 列表时由后端 `main_tag_polarity` 驱动。
 * 利空：黄灯感淡黄；利好：绿淡色；两边都有：warning 淡色。
 */
export function hotTopicTitleRowSx(
  polarity: StockHotTopicItem['main_tag_polarity']
): SxProps {
  switch (polarity) {
    case 'positive':
      return { ...titleRowBase, bgcolor: 'success.softBg' };
    case 'negative':
      return {
        ...titleRowBase,
        /** 黄灯式淡黄，与 danger 红区分 */
        bgcolor: '#fffbeb',
      };
    case 'both':
      return { ...titleRowBase, bgcolor: 'warning.softBg' };
    default:
      return { ...titleRowBase, bgcolor: 'transparent' };
  }
}
