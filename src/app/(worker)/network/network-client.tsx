"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Award, Inbox, Compass, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { GlassCard } from "@/components/shared/glass-card";
import { ConnectionCard } from "@/components/worker/network/connection-card";
import { SuggestionCard } from "@/components/worker/network/suggestion-card";
import { RequestCard } from "@/components/worker/network/request-card";
import { EndorsementSection } from "@/components/worker/network/endorsement-section";
import { ActivityFeed } from "@/components/worker/network/activity-feed";
import { useNetwork } from "@/hooks/useNetwork";

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

type TabId = "my-network" | "discover" | "requests";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NetworkClient() {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const {
    connections,
    suggestions,
    incomingRequests,
    outgoingRequests,
    endorsements,
    totalEndorsements,
    removeConnection,
    sendRequest,
    acceptRequest,
    rejectRequest,
    endorseSkill,
  } = useNetwork();

  const [activeTab, setActiveTab] = useState<TabId>("my-network");
  const [search, setSearch] = useState("");
  const [requestToggle, setRequestToggle] = useState<"incoming" | "outgoing">(
    "incoming"
  );

  const pendingCount = incomingRequests.length;

  const tabs: Array<{ id: TabId; label: string; badge?: number }> = [
    { id: "my-network", label: t("network.tabs.connections") },
    { id: "discover", label: t("network.tabs.suggestions") },
    { id: "requests", label: t("network.tabs.requests"), badge: pendingCount },
  ];

  /* -- Filtered connections ---------------------------------------- */
  const filteredConnections = useMemo(() => {
    if (!search.trim()) return connections;
    const q = search.toLowerCase();
    return connections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [connections, search]);

  /* -- Dismissed suggestions --------------------------------------- */
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const visibleSuggestions = suggestions.filter(
    (s) => !dismissedSuggestions.has(s.id)
  );

  function handleDismissSuggestion(id: string) {
    setDismissedSuggestions((prev) => new Set(prev).add(id));
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("network.title")}
        subtitle={t("network.connections.title")}
      />

      {/* Stats bar */}
      <motion.div
        className="flex flex-wrap items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-medium text-brand-700">
          <Users className="size-4" />
          {connections.length} {t("network.tabs.connections").toLowerCase()}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
          <Award className="size-4" />
          {totalEndorsements} {t("network.tabs.endorsements").toLowerCase()}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <motion.span
                className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {tab.badge}
              </motion.span>
            )}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                layoutId="network-tab-indicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "my-network" && (
          <motion.div
            key="my-network"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col gap-6"
          >
            {/* Search */}
            <SearchInput
              placeholder={t("network.connections.search")}
              value={search}
              onChange={setSearch}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Connection grid */}
              <div className="lg:col-span-2">
                {filteredConnections.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={tc("empty.noConnections")}
                    description={
                      search
                        ? tc("empty.noSearchResults")
                        : tc("empty.noConnections")
                    }
                    action={
                      !search
                        ? {
                            label: t("network.tabs.suggestions"),
                            onClick: () => setActiveTab("discover"),
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredConnections.map((conn, i) => (
                      <ConnectionCard
                        key={conn.id}
                        connection={conn}
                        index={i}
                        onRemove={removeConnection}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: endorsements + activity */}
              <div className="flex flex-col gap-6">
                <GlassCard hover={false}>
                  <EndorsementSection
                    endorsements={endorsements}
                    isConnected
                    onEndorse={endorseSkill}
                  />
                </GlassCard>

                <GlassCard hover={false}>
                  <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
                    {t("dashboard.recentActivity")}
                  </h3>
                  <ActivityFeed activities={[]} />
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "discover" && (
          <motion.div
            key="discover"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-muted-foreground">
              {t("network.suggestions.title")}
            </p>

            {visibleSuggestions.length === 0 ? (
              <EmptyState
                icon={Compass}
                title={t("network.tabs.suggestions")}
                description={tc("empty.noData")}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSuggestions.map((sug, i) => (
                  <SuggestionCard
                    key={sug.id}
                    suggestion={sug}
                    index={i}
                    onConnect={sendRequest}
                    onDismiss={handleDismissSuggestion}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col gap-4"
          >
            {/* Toggle: incoming / outgoing */}
            <div className="flex gap-2">
              {(["incoming", "outgoing"] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setRequestToggle(dir)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                    requestToggle === dir
                      ? "bg-brand-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {dir === "incoming" ? t("network.requests.title") : t("network.tabs.requests")}
                  {dir === "incoming" && incomingRequests.length > 0 && (
                    <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                      {incomingRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Request list */}
            <AnimatePresence mode="wait">
              {requestToggle === "incoming" ? (
                <motion.div
                  key="incoming"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  {incomingRequests.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title={t("network.requests.noRequests")}
                      description={t("network.requests.noRequests")}
                    />
                  ) : (
                    incomingRequests.map((req, i) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        index={i}
                        onAccept={acceptRequest}
                        onReject={rejectRequest}
                      />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="outgoing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  {outgoingRequests.length === 0 ? (
                    <EmptyState
                      icon={Network}
                      title={t("network.requests.noRequests")}
                      description={t("network.requests.noRequests")}
                    />
                  ) : (
                    outgoingRequests.map((req, i) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        index={i}
                        onCancel={rejectRequest}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
