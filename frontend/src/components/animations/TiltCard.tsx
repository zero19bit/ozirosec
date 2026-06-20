import { ReactNode } from 'react';
import { motion, useMotionTemplate } from 'framer-motion';
import { useTilt } from '../../hooks/useTilt';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className = '', maxTilt = 9 }: TiltCardProps) {
  const tilt = useTilt({ maxTilt });
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(74, 222, 128, 0.22), transparent 42%)`;
  const boxShadow = useMotionTemplate`${tilt.shadowX}px ${tilt.shadowY}px 52px rgba(15, 23, 42, 0.24)`;

  return (
    <motion.div
      ref={tilt.ref}
      className={`group/tilt relative rounded-2xl ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      {...tilt.bind}
    >
      <motion.div
        className="relative h-full rounded-[inherit] will-change-transform"
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          scale: tilt.scale,
          boxShadow: tilt.isHovering ? boxShadow : '0 16px 42px rgba(15, 23, 42, 0.08)',
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: glowBackground, transform: 'translateZ(38px)' }}
        />
        <div className="relative h-full rounded-[inherit]" style={{ transform: 'translateZ(18px)' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

