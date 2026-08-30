import React, { useEffect, useState } from 'react';
import { useSpring, useMotionValue, useTransform, motion } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { damping: 25, stiffness: 120 });
  const [displayValue, setDisplayValue] = useState<string>(value.toFixed(decimals));

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(Number(latest).toFixed(decimals));
    });
  }, [spring, decimals]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
