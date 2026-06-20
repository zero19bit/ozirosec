import { PointerEvent as ReactPointerEvent, ReactNode, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  to: string;
}

export function MagneticButton({ children, className = '', to }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.55 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.55 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const distanceX = event.clientX - (rect.left + rect.width / 2);
    const distanceY = event.clientY - (rect.top + rect.height / 2);

    x.set(distanceX * 0.18);
    y.set(distanceY * 0.18);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="inline-flex will-change-transform"
      style={{ x: prefersReducedMotion ? 0 : x, y: prefersReducedMotion ? 0 : y }}
    >
      <Link
        ref={ref}
        to={to}
        className={className}
        onPointerLeave={reset}
        onPointerMove={handlePointerMove}
      >
        {children}
      </Link>
    </motion.div>
  );
}

