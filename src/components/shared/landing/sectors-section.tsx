"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  HardHat,
  Hotel,
  Wheat,
  Factory,
  Monitor,
} from "lucide-react";

const sectors = [
  {
    icon: HardHat,
    name: "Construccion",
    demand: "Muy Alta",
    demandColor: "bg-red-100 text-red-700",
    countries: ["DE", "AT", "CH", "AU", "CA"],
    description: "Operarios, electricistas, soldadores y mas. Alta demanda en Europa y Norteamerica.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Hotel,
    name: "Hoteleria",
    demand: "Alta",
    demandColor: "bg-orange-100 text-orange-700",
    countries: ["ES", "AE", "US", "FR", "AU"],
    description: "Recepcion, cocina, limpieza y servicio al cliente en destinos turisticos globales.",
    gradient: "from-brand-500 to-brand-600",
  },
  {
    icon: Wheat,
    name: "Agricultura",
    demand: "Alta",
    demandColor: "bg-orange-100 text-orange-700",
    countries: ["CA", "AU", "ES", "DE", "US"],
    description: "Cosecha, procesamiento y empaque. Oportunidades estacionales y permanentes.",
    gradient: "from-green-500 to-green-700",
  },
  {
    icon: Factory,
    name: "Manufactura",
    demand: "Media",
    demandColor: "bg-yellow-100 text-yellow-700",
    countries: ["DE", "US", "CA", "AT", "CH"],
    description: "Produccion, ensamblaje y control de calidad en plantas industriales.",
    gradient: "from-slate-500 to-slate-700",
  },
  {
    icon: Monitor,
    name: "Tecnologia",
    demand: "Creciente",
    demandColor: "bg-blue-100 text-blue-700",
    countries: ["US", "DE", "CA", "AE", "AU"],
    description: "Desarrollo, soporte IT y servicios digitales para empresas internacionales.",
    gradient: "from-blue-500 to-indigo-600",
  },
];

const flagMap: Record<string, string> = {
  DE: "🇩🇪",
  AT: "🇦🇹",
  CH: "🇨🇭",
  AU: "🇦🇺",
  CA: "🇨🇦",
  ES: "🇪🇸",
  AE: "🇦🇪",
  US: "🇺🇸",
  FR: "🇫🇷",
};

export function SectorsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="sectores"
      ref={sectionRef}
      className="relative bg-cream py-20 sm:py-28 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream-light to-cream" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-4">
            Oportunidades por industria
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
            Sectores con Alta Demanda
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Industrias que buscan activamente talento internacional con contratos estables y buenos beneficios.
          </p>
        </motion.div>

        {/* Sector cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, i) => {
            const Icon = sector.icon;
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={sector.name}
                initial={{
                  opacity: 0,
                  x: fromLeft ? -60 : 60,
                }}
                animate={
                  isInView
                    ? { opacity: 1, x: 0 }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${sector.gradient} mb-4 shadow-lg`}
                >
                  <Icon className="size-6 text-white" />
                </div>

                {/* Name + demand badge */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-heading text-xl font-bold text-brand-900">
                    {sector.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sector.demandColor}`}
                  >
                    {sector.demand}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {sector.description}
                </p>

                {/* Country flags */}
                <div className="flex items-center gap-1.5">
                  {sector.countries.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-100 text-base"
                      title={code}
                    >
                      {flagMap[code]}
                    </span>
                  ))}
                </div>

                {/* Hover accent */}
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
