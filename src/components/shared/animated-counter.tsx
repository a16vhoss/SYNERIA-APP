"use client";

import { useEffect, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  useTransform,
  motion,
} from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  format?: "number" | "currency" | "compact";
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1.5,
  format = "number",
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    duration: duration * 1000,
  });

  const formatValue = (val: number): string => {
    const rounded = Math.round(val);
    switch (format) {
      case "currency":
        return rounded.toLocaleString("es-ES", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      case "compact":
        if (rounded >= 1_000_000)
          return `${(rounded / 1_000_000).toFixed(1)}M`;
        if (rounded >= 1_000) return `${(rounded / 1_000).toFixed(1)}K`;
        return rounded.toLocaleString("es-ES");
      default:
        return rounded.toLocaleString("es-ES");
    }
  };

  const displayed = useTransform(springValue, (latest) => formatValue(latest));

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    }
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsubscribe = displayed.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest}${suffix}`;
      }
    });
    return unsubscribe;
  }, [displayed, prefix, suffix]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
