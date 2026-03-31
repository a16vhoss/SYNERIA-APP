"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

const testimonialKeys = [
  {
    key: "testimonial1",
    flag: "\u{1F1E8}\u{1F1F4}",
    avatar: "CR",
    gradient: "from-brand-500 to-brand-700",
  },
  {
    key: "testimonial2",
    flag: "\u{1F1E9}\u{1F1EA}",
    avatar: "SM",
    gradient: "from-brand-400 to-brand-600",
  },
  {
    key: "testimonial3",
    flag: "\u{1F1F2}\u{1F1FD}",
    avatar: "MG",
    gradient: "from-brand-600 to-brand-800",
  },
] as const;

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const t = useTranslations("common.landing.testimonials");

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream-light py-20 sm:py-28 overflow-hidden"
    >
      {/* Decorative bg */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-50/40 blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-4">
            {t("badge")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonialKeys.map((testimonial, i) => (
            <motion.div
              key={testimonial.key}
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, rotateY: 0 }
                  : {}
              }
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 p-6 sm:p-7 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="size-8 text-brand-200 fill-brand-100" />
              </div>

              {/* Quote text */}
              <p className="text-foreground/80 leading-relaxed mb-6 text-[15px]">
                &ldquo;{t(`${testimonial.key}.quote`)}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-sm shadow-md`}
                >
                  {testimonial.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-brand-900 text-sm truncate">
                      {t(`${testimonial.key}.name`)}
                    </span>
                    <span className="text-base" title={t(`${testimonial.key}.country`)}>
                      {testimonial.flag}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {t(`${testimonial.key}.role`)}
                  </p>
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-0.5 bg-gradient-to-l from-brand-300/30 to-transparent rotate-45 translate-x-4 translate-y-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
