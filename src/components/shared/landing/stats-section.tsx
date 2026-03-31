"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Users, Building2, Globe, ThumbsUp } from "lucide-react";

const stats = [
  {
    target: 12500,
    suffix: "+",
    label: "Trabajadores Registrados",
    icon: Users,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
  {
    target: 3200,
    suffix: "+",
    label: "Empresas Activas",
    icon: Building2,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
  {
    target: 28,
    label: "Paises",
    icon: Globe,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
  {
    target: 96,
    suffix: "%",
    label: "Satisfaccion",
    icon: ThumbsUp,
    color: "text-brand-600",
    bgColor: "bg-brand-50",
  },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream-light py-20 sm:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative group text-center p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-4`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-800 mb-2">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix || ""}
                    duration={2}
                    format="number"
                  />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {stat.label}
                </p>
                {/* Subtle accent line */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-brand-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "40%" } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
