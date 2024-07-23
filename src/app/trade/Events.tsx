import { Chip, Tooltip } from '@mui/joy';
import dayjs from 'dayjs';

type Props = {
  title: string;
  events: any[];
};
export default function Events({ title, events }: Props) {
  events = events || [];

  return (
    <div className=" mb-2 overflow-hidden">
      <div className="text-sm font-bold opacity-85">{title}</div>
      {events.length == 0 && (
        <span className="text-[12px] pl-2 inline-block">暂无</span>
      )}
      {events.map((event: any, index: number) => (
        <div
          className="flex flex-row items-start pt-2 text-[12px] "
          key={index}
        >
          <Chip
            className="mx-2 !text-[12px]"
            color="primary"
            variant="soft"
            size="sm"
          >
            {event.event_type}
          </Chip>
          <Tooltip
            title={<div className="w-[300px]">{event.event_content || ''}</div>}
            variant="solid"
            // className="w-[400px]"
          >
            <p className="h-[20px] text-ellipsis overflow-hidden whitespace-nowrap">
              <span className="mr-1">
                {dayjs(event.timestamp).format('YYYY-MM-DD')}
              </span>
              {event.event_content || ''}
            </p>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
