"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MessageSquare, Briefcase } from "lucide-react";

import { CompanyHeader } from "@/components/employer/company-header";
import { CompanyStats } from "@/components/employer/company-stats";
import { GlassCard } from "@/components/shared/glass-card";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
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

interface CompanyData {
  id: string;
  name: string;
  sector: string;
  logo_url: string | null;
  verified: boolean;
  country: string;
  city: string;
  description: string;
}

interface VacancyData {
  id: string;
  title: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  company_id: string;
}

export default function PublicCompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const t = useTranslations("worker");

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [activeVacancies, setActiveVacancies] = useState<VacancyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        // Fetch company
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", companyId)
          .single();

        if (companyData) {
          setCompany({
            id: companyData.id,
            name: companyData.name ?? "",
            sector: companyData.sector ?? "",
            logo_url: companyData.logo_url ?? null,
            verified: companyData.verified ?? false,
            country: companyData.country ?? "",
            city: companyData.city ?? "",
            description: companyData.description ?? "",
          });

          // Fetch active vacancies for this company
          const { data: vacanciesData } = await supabase
            .from("jobs")
            .select("*")
            .eq("company_id", companyId)
            .eq("status", "active");

          setActiveVacancies(
            (vacanciesData ?? []).map((v: Record<string, unknown>) => ({
              id: v.id as string,
              title: (v.title as string) ?? "",
              location: `${(v.city as string) ?? ""}, ${(v.country as string) ?? ""}`,
              salary_min: (v.salary_min as number) ?? null,
              salary_max: (v.salary_max as number) ?? null,
              status: (v.status as string) ?? "active",
              company_id: (v.company_id as string) ?? "",
            }))
          );
        }
      } catch {
        // Supabase not available — leave defaults
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Briefcase className="mb-4 size-12 text-muted-foreground" />
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t("company.noVacancies")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La empresa que buscas no existe o no esta disponible.
        </p>
      </div>
    );
  }

  const countryName =
    COUNTRIES.find((c) => c.code === company.country)?.name ?? company.country;
  const location = `${company.city}, ${countryName}`;

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
              {t("jobs.detail.aboutCompany")}
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
          employeesCount={0}
          activeJobs={activeVacancies.length}
          avgRating={avgRating}
        />
      </motion.div>

      {/* Active Jobs */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          {t("company.companyJobs")}
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
                    : t("jobs.detail.salaryNegotiable"),
                  tags: [],
                }}
              />
            ))}
          </div>
        ) : (
          <GlassCard hover={false}>
            <EmptyState
              icon={Briefcase}
              title={t("company.noVacancies")}
              description={t("company.noVacanciesDesc")}
            />
          </GlassCard>
        )}
      </motion.div>

      {/* Reviews section - placeholder */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          {t("company.reviews")}
        </h2>
        <GlassCard hover={false}>
          <EmptyState
            icon={MessageSquare}
            title={t("company.noReviews")}
            description={t("company.noReviewsDesc")}
          />
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
