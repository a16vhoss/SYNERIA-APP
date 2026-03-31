"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { AnimatedLeftPanel } from "@/components/auth/animated-left-panel";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

export function LoginClient() {
  const t = useTranslations("auth");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - hidden on mobile */}
      <div className="hidden lg:block lg:w-[45%]">
        <AnimatedLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex w-full flex-col lg:w-[55%]">
        {/* Mobile header strip */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-4 lg:hidden">
          <h2 className="font-heading text-lg font-bold text-white">Syneria</h2>
          <p className="text-sm text-white/70">{t("login.subtitle")}</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-md">
            {/* Tab Switcher */}
            <div className="relative mb-8 flex rounded-full bg-cream-dark p-1">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative z-10 flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-colors"
                  style={{
                    color: activeTab === tab ? "#1B4332" : "#6B7280",
                  }}
                >
                  {tab === "login" ? t("login.submit") : t("register.title")}
                </button>
              ))}
              <motion.div
                className="absolute inset-y-1 rounded-full bg-white shadow-sm"
                style={{ width: "50%" }}
                animate={{ x: activeTab === "login" ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "login" ? 20 : -20 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
