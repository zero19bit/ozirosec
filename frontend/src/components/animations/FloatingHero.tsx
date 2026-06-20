import { motion, useReducedMotion } from 'framer-motion';
import { useParallax } from '../../hooks/useParallax';

interface FloatingHeroProps {
  darkMode: boolean;
}

export function FloatingHero({ darkMode }: FloatingHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const primary = useParallax({ depth: 22 });
  const secondary = useParallax({ depth: 34 });
  const still = { y: 0, opacity: 0.48 };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className={`absolute inset-x-[-12%] top-[-18%] h-[58rem] opacity-70 ${
          darkMode ? 'bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_58%)]' : 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_58%)]'
        }`}
        style={{ x: primary.translateX, y: primary.translateY }}
      />
      <motion.div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          x: secondary.inverseX,
          y: secondary.inverseY,
          backgroundImage: `
            linear-gradient(to right, rgba(74, 222, 128, 0.42) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.34) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at 50% 20%, black, transparent 70%)',
        }}
      />
      <motion.div
        className="absolute left-[8%] top-24 h-64 w-64 rounded-full bg-green-400/10 blur-3xl"
        animate={prefersReducedMotion ? still : { y: [0, -18, 0], opacity: [0.45, 0.72, 0.45] }}
        style={{ x: primary.inverseX }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[6%] top-8 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"
        animate={prefersReducedMotion ? still : { y: [0, 22, 0], opacity: [0.35, 0.62, 0.35] }}
        style={{ x: secondary.translateX }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[18%] top-44 h-2 w-2 rounded-full bg-green-300 shadow-[0_0_30px_rgba(74,222,128,0.9)]"
        animate={prefersReducedMotion ? still : { y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[24%] top-32 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(103,232,249,0.8)]"
        animate={prefersReducedMotion ? still : { y: [0, 14, 0], opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

