import { Link } from '@mui/joy';
import { ReactNode } from 'react';
import { MdArrowDownward } from 'react-icons/md';

type Props = {
  sortState: {
    type: 'asc' | 'desc' | undefined;
    field: string | undefined;
  };
  name: string;
  changeSort(field: string, type: string): Promise<void>;
  children: ReactNode;
};

export default function SortCell({
  children,
  name,
  sortState,
  changeSort,
}: Props) {
  const isSorting = sortState.field === name;
  return (
    <Link
      underline="none"
      color="neutral"
      textColor={isSorting ? 'primary.plainColor' : undefined}
      component="button"
      onClick={() => {
        changeSort(
          name,
          isSorting ? (sortState.type === 'asc' ? 'desc' : 'asc') : 'desc'
        );
      }}
      fontWeight="lg"
      startDecorator={isSorting ? <MdArrowDownward /> : ''}
      sx={
        {
          '& svg': {
            transition: '0.2s',
            transform:
              isSorting &&
              (sortState.type === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)'),
          },
          '&:hover': { '& svg': { opacity: 1 } },
        } as any
      }
    >
      {children}
    </Link>
  );
}
