"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  UserPlus,
  ClipboardCheck,
  Search,
  Handshake,
  Globe2,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Crea tu cuenta",
    description:
      "Registrate como trabajador o empresa en menos de 2 minutos. Selecciona tu rol y comienza.",
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "Completa tu perfil",
    description:
      "Agrega tu experiencia, habilidades, idiomas y documentos. Un perfil completo multiplica tus oportunidades.",
  },
  {
    icon: Search,
    number: "03",
    title: "Busca empleos",
    description:
      "Explora empleos filtrados por sector, pais y salario. Nuestro sistema te sugiere las mejores coincidencias.",
  },
  {
    icon: Handshake,
    number: "04",
    title: "Aplica y conecta",
    description:
      "Envia tu aplicacion directamente. Comunicate con empleadores y firma contratos digitales seguros.",
  },
  {
    icon: Globe2,
    number: "05",
    title: "Trabaja globalmente",
    description:
      "Gestiona tu contrato, recibe pagos en tu wallet y construye tu carrera internacional.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative bg-white py-20 sm:py-28 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-4">
            Proceso simple
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            En 5 pasos simples, conecta tu talento con oportunidades globales.
          </p>
        </motion.div>

        {/* Timeline - desktop horizontal, mobile vertical */}
        <div className="relative">
          {/* Desktop horizontal connecting line */}
          <motion.div
            className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-brand-100"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            style={{ originX: 0 }}
          />
          <motion.div
            className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-brand-500"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
            style={{ originX: 0 }}
          />

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + i * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Number circle */}
                  <div className="relative mb-5">
                    <motion.div
                      className="w-[72px] h-[72px] rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center group-hover:border-brand-400 group-hover:bg-brand-100 transition-colors duration-300"
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Icon className="size-7 text-brand-600" />
                    </motion.div>
                    {/* Step number badge */}
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {step.number}
                    </span>
                  </div>

                  {/* Mobile connecting line */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-[72px] left-1/2 -translate-x-1/2 w-0.5 h-8 bg-brand-200 lg:hidden sm:hidden" />
                  )}

                  <h3 className="font-heading text-base font-bold text-brand-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
