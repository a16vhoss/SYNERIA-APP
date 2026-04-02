"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Globe, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
];

export function TabConfiguracion() {
  const t = useTranslations("worker");
  const tc = useTranslations("common");
  const [notifJobs, setNotifJobs] = useState(true);
  const [notifApplications, setNotifApplications] = useState(true);
  const [frequency, setFrequency] = useState("semanal");
  const [language, setLanguage] = useState("es");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load settings from profile on mount
  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .single();

      if (profile?.settings && typeof profile.settings === "object") {
        const s = profile.settings as Record<string, unknown>;
        if (typeof s.notifJobs === "boolean") setNotifJobs(s.notifJobs);
        if (typeof s.notifApplications === "boolean") setNotifApplications(s.notifApplications);
        if (typeof s.frequency === "string") setFrequency(s.frequency);
        if (typeof s.language === "string") setLanguage(s.language);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const settings = { notifJobs, notifApplications, frequency, language };

      const { error } = await supabase
        .from("profiles")
        .update({ settings })
        .eq("id", userId);

      if (error) throw error;

      // Persist language preference via cookie and reload to apply
      document.cookie = `NEXT_LOCALE=${language};path=/;max-age=${60 * 60 * 24 * 365}`;
      toast.success(tc("misc.savedSuccessfully"));

      // Reload after a short delay so the toast is visible
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error(tc("misc.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== t("profile.settings.deleteKeyword") || !userId) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      // Sign out and redirect — actual account deletion requires admin/edge function
      await supabase.auth.signOut();
      toast.success(t("profile.settings.sessionClosed"));
      window.location.href = "/login";
    } catch {
      toast.error(tc("misc.error"));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Notifications */}
      <motion.div variants={fadeUp} className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-600" />
          <h3 className="font-heading text-lg font-semibold">
            {t("profile.settings.emailNotifications")}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-jobs" className="cursor-pointer">
              {t("profile.settings.newMatchingJobs")}
            </Label>
            <Switch
              id="notif-jobs"
              checked={notifJobs}
              onCheckedChange={setNotifJobs}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-apps" className="cursor-pointer">
              {t("profile.settings.applicationStatus")}
            </Label>
            <Switch
              id="notif-apps"
              checked={notifApplications}
              onCheckedChange={setNotifApplications}
            />
          </div>
          <div className="pt-2">
            <Label className="mb-2 block text-sm text-muted-foreground">
              {t("profile.settings.frequency")}
            </Label>
            <Select value={frequency} onValueChange={(v) => v && setFrequency(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diaria">{t("profile.settings.daily")}</SelectItem>
                <SelectItem value="semanal">{t("profile.settings.weekly")}</SelectItem>
                <SelectItem value="mensual">{t("profile.settings.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div variants={fadeUp} className="rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-600" />
          <h3 className="font-heading text-lg font-semibold">
            {t("profile.settings.platformLanguage")}
          </h3>
        </div>
        <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Save button */}
      <motion.div variants={fadeUp}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("profile.settings.saveSettings")}
        </Button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl border-2 border-red-200 bg-red-50/50 p-6"
      >
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-heading text-lg font-semibold text-red-700">
            {t("profile.settings.dangerZone")}
          </h3>
        </div>
        <p className="mb-4 text-sm text-red-600">
          {t("profile.settings.deleteWarning")}
        </p>
        <Button
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {tc("actions.delete")} {t("profile.settings.myAccount")}
        </Button>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-700">
              {t("profile.settings.deleteAccountTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("profile.settings.deleteConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={t("profile.settings.typeDeletePlaceholder")}
            className="border-red-300 focus-visible:ring-red-500"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {tc("actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirm !== t("profile.settings.deleteKeyword") || deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("profile.settings.deletePermanently")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
