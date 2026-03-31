"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MessageSquare, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InterviewFeedbackPanelProps {
  candidateId: string;
  candidateName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function InterviewFeedbackPanel({
  candidateId,
  candidateName,
  onAccept,
  onReject,
}: InterviewFeedbackPanelProps) {
  const [feedback, setFeedback] = useState("");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save feedback with debounce
  useEffect(() => {
    if (!feedback.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // In production: save to Supabase
      // await supabase.from('interview_feedback').upsert({ candidate_id: candidateId, feedback })
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [feedback, candidateId]);

  return (
    <motion.div
      className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-amber-600" />
        <h4 className="text-sm font-semibold text-foreground">
          Feedback post-entrevista
        </h4>
        {saved && (
          <motion.span
            className="flex items-center gap-1 text-xs text-emerald-600"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <Save className="size-3" />
            Guardado
          </motion.span>
        )}
      </div>

      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={`Notas privadas sobre la entrevista con ${candidateName}...`}
        className="min-h-[80px] bg-white/60"
      />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={onAccept}
        >
          <CheckCircle2 className="mr-1.5 size-3.5" />
          Aceptar Candidato
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onReject}
        >
          <XCircle className="mr-1.5 size-3.5" />
          Rechazar Candidato
        </Button>
      </div>
    </motion.div>
  );
}
