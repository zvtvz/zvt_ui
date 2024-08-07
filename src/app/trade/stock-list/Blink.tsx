import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type Props = {
  mkey: string | number;
  children?: ReactNode;
};

export default function Blink({ children, mkey }: Props) {
  return (
    <motion.div
      key={mkey}
      className="relative"
      // initial={{ opacity: 0.3, backgroundColor: 'green' }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.3 }}
      transition={{
        duration: 0.2,
        delay: Math.random() * 0.4,
      }}
      style={{
        transitionProperty: 'opacity',
      }}
    >
      {children || mkey}
    </motion.div>
  );
}
