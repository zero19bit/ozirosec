import { PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from 'react';
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

interface UseTiltOptions {
  maxTilt?: number;
  scale?: number;
  shadowDepth?: number;
}

export function useTilt({ maxTilt = 10, scale = 1.02, shadowDepth = 28 }: UseTiltOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springConfig = { stiffness: 260, damping: 28, mass: 0.7 };

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);
  const glowX = useSpring(useTransform(pointerX, [-0.5, 0.5], [0, 100]), springConfig);
  const glowY = useSpring(useTransform(pointerY, [-0.5, 0.5], [0, 100]), springConfig);
  const shadowX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-shadowDepth, shadowDepth]), springConfig);
  const shadowY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-shadowDepth, shadowDepth]), springConfig);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }, [pointerX, pointerY, prefersReducedMotion]);

  const onPointerEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    setIsHovering(false);
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return {
    ref,
    isHovering,
    rotateX: prefersReducedMotion ? 0 : rotateX,
    rotateY: prefersReducedMotion ? 0 : rotateY,
    scale: prefersReducedMotion || !isHovering ? 1 : scale,
    glowX,
    glowY,
    shadowX,
    shadowY,
    bind: {
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
    },
  };
}

