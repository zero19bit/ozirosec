import { useEffect } from 'react';
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

interface UseParallaxOptions {
  depth?: number;
}

export function useParallax({ depth = 24 }: UseParallaxOptions = {}) {
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 90, damping: 24, mass: 0.8 };
  const translateX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-depth, depth]), springConfig);
  const translateY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-depth, depth]), springConfig);
  const inverseX = useSpring(useTransform(pointerX, [-0.5, 0.5], [depth, -depth]), springConfig);
  const inverseY = useSpring(useTransform(pointerY, [-0.5, 0.5], [depth, -depth]), springConfig);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [pointerX, pointerY, prefersReducedMotion]);

  return {
    translateX: prefersReducedMotion ? 0 : translateX,
    translateY: prefersReducedMotion ? 0 : translateY,
    inverseX: prefersReducedMotion ? 0 : inverseX,
    inverseY: prefersReducedMotion ? 0 : inverseY,
  };
}

