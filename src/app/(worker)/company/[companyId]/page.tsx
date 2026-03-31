"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Briefcase } from "lucide-react";

import { CompanyHeader } from "@/components/employer/company-header";
import { CompanyStats } from "@/components/employer/company-stats";
import { GlassCard } from "@/components/shared/glass-card";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MOCK_COMPANY,
  MOCK_VACANCIES,
} from "@/lib/constants/mock-data";
import { COUNTRIES } from "@/lib/constants/countries";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function PublicCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);

  // In production, fetch company by companyId from Supabase
  const company = MOCK_COMPANY;
  const countryName =
    COUNTRIES.find((c) => c.code === company.country)?.name ?? company.country;
  const location = `${company.city}, ${countryName}`;

  // Get active jobs for this company
  const activeVacancies = MOCK_VACANCIES.filter(
    (v) => v.company_id === company.id && v.status === "active"
  );

  // Mock rating
  const avgRating = 4.3;

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Company Header */}
      <motion.div variants={fadeUp}>
        <GlassCard hover={false}>
          <CompanyHeader
            name={company.name}
            letter={company.name.charAt(0)}
            gradient="green"
            sector={company.sector}
            location={location}
            verified={company.verified}
            rating={avgRating}
          />
        </GlassCard>
      </motion.div>

      {/* Description */}
      {company.description && (
        <motion.div variants={fadeUp}>
          <GlassCard hover={false}>
            <h2 className="mb-3 font-heading text-lg font-semibold text-foreground">
              Sobre la empresa
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {company.description}
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={fadeUp}>
        <CompanyStats
          employeesCount={120}
          activeJobs={activeVacancies.length}
          avgRating={avgRating}
        />
      </motion.div>

      {/* Active Jobs */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          Empleos de esta empresa
        </h2>
        {activeVacancies.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeVacancies.map((vacancy, index) => (
              <JobCard
                key={vacancy.id}
                index={index}
                job={{
                  id: vacancy.id,
                  companyName: company.name,
                  companyLetter: company.name.charAt(0),
                  companyGradient: "green",
                  title: vacancy.title,
                  location: vacancy.location,
                  salary: vacancy.salary_min && vacancy.salary_max
                    ? `$${vacancy.salary_min.toLocaleString()} - $${vacancy.salary_max.toLocaleString()}/mes`
                    : "A convenir",
                  tags: [],
                }}
              />
            ))}
          </div>
        ) : (
          <GlassCard hover={false}>
            <EmptyState
              icon={Briefcase}
              title="Sin vacantes activas"
              description="Esta empresa no tiene vacantes publicadas en este momento."
            />
          </GlassCard>
        )}
      </motion.div>

      {/* Reviews section - placeholder */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          Resenas
        </h2>
        <GlassCard hover={false}>
          <EmptyState
            icon={MessageSquare}
            title="Sin resenas aun"
            description="Todavia no hay resenas para esta empresa. Se la primera persona en dejar una."
          />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
