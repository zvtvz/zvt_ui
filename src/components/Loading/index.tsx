import { CircularProgress } from '@mui/joy';
import { ReactNode } from 'react';

type Props = {
  loading: boolean;
  children: ReactNode;
  className?: string;
  fixedTop?: number;
};

export default function Loading({
  loading,
  children,
  className,
  fixedTop = 0,
}: Props) {
  if (!loading) return children;

  const centerCls = 'flex justify-center items-center';
  const fixedTopCls = `flex justify-center items-start pt-[${fixedTop}px]`;

  return (
    <div
      className={`w-full h-full ${
        fixedTop ? fixedTopCls : centerCls
      } ${className}`}
    >
      <CircularProgress color="primary" size="md" variant="soft" />
    </div>
  );
}
