import {
  Card,
  CardContent,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  tabClasses,
} from '@mui/joy';
import NewsAnalysisesRealTime from './NewsAnalysisesRealTime';
import NewsAnalysisesStats from './NewsAnalysisesStats';
import { useEffect } from 'react';

export default function NewsAnalysises({ dialog }: { dialog: any }) {
  return (
    <Card size="sm" variant="plain" className="mb-[100px]">
      <CardContent>
        <Tabs
          variant="outlined"
          orientation="horizontal"
          aria-label="Placement indicator tabs"
          defaultValue="sync"
          sx={{
            gridColumn: '1/-1',
            flexDirection: 'column',
            bgcolor: '#fff',
            border: 'none',
          }}
        >
          <TabList
            underlinePlacement="bottom"
            sx={{
              pt: 1,
              fontSize: 14,
              [`&& .${tabClasses.root}`]: {
                flex: 'initial',
                bgcolor: '#fff',
                '&:hover': {
                  bgcolor: '#fff',
                },
                [`&.${tabClasses.selected}`]: {
                  color: 'primary.plainColor',
                  '&::after': {
                    height: 2,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    bgcolor: 'primary.500',
                  },
                },
              },
            }}
          >
            <Tab indicatorPlacement="bottom" value="sync">
              AI实时分析
            </Tab>
            <Tab indicatorPlacement="bottom" value="stats">
              AI分析汇总
            </Tab>
          </TabList>
          <TabPanel value="sync">
            <NewsAnalysisesRealTime dialog={dialog} />
          </TabPanel>
          <TabPanel value="stats">
            <NewsAnalysisesStats dialog={dialog} />
          </TabPanel>
        </Tabs>
      </CardContent>
    </Card>
  );
}
