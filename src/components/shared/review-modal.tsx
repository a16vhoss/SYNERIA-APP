"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/shared/star-rating";
import { CompanyAvatar } from "@/components/shared/company-avatar";
import { ReviewTagSelector } from "@/components/shared/review-tag-selector";
import type { ReviewTag } from "@/lib/constants/mock-data";

const ratingLabelKeys: Record<number, string> = {
  1: "terrible",
  2: "bad",
  3: "average",
  4: "good",
  5: "excellent",
};

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractPosition: string;
  counterpartyName: string;
  counterpartyLetter: string;
  counterpartyGradient: "green" | "orange" | "purple" | "blue" | "red" | "teal";
  onSubmit?: (data: {
    rating: number;
    tags: ReviewTag[];
    comment: string;
  }) => void;
}

export function ReviewModal({
  open,
  onOpenChange,
  contractPosition,
  counterpartyName,
  counterpartyLetter,
  counterpartyGradient,
  onSubmit,
}: ReviewModalProps) {
  const t = useTranslations("worker");
  const tc = useTranslations("common");

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const maxComment = 500;
  const canSubmit = rating > 0;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit?.({ rating, tags, comment });
    setSubmitted(true);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      // Reset state on close
      setTimeout(() => {
        setRating(0);
        setTags([]);
        setComment("");
        setSubmitted(false);
      }, 300);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="flex flex-col items-center gap-4 py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  delay: 0.15,
                }}
              >
                <CheckCircle2 className="size-16 text-emerald-500" />
              </motion.div>
              <motion.h3
                className="font-heading text-lg font-semibold text-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t("reviews.success")}
              </motion.h3>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {tc("misc.savedSuccessfully")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="outline" onClick={() => handleClose(false)}>
                  {tc("actions.close")}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="flex flex-col gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle>{t("reviews.writeReview")}</DialogTitle>
                <DialogDescription>
                  {t("reviews.comment")}
                </DialogDescription>
              </DialogHeader>

              {/* Contract info */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <CompanyAvatar
                  letter={counterpartyLetter}
                  gradient={counterpartyGradient}
                  size="md"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {counterpartyName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {contractPosition}
                  </span>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex flex-col items-center gap-2">
                <StarRating
                  interactive
                  value={rating}
                  onChange={setRating}
                  size="lg"
                />
                <AnimatePresence mode="wait">
                  {rating > 0 && (
                    <motion.span
                      key={rating}
                      className="text-sm font-medium text-foreground"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {t(`reviews.ratingLabels.${ratingLabelKeys[rating]}`)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("reviews.title")}
                </label>
                <ReviewTagSelector
                  selected={tags}
                  onChange={setTags}
                  maxSelectable={5}
                />
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("reviews.comment")}
                </label>
                <Textarea
                  placeholder={t("reviews.commentPlaceholder")}
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value.slice(0, maxComment))
                  }
                  rows={3}
                />
                <span className="self-end text-[11px] text-muted-foreground">
                  {comment.length}/{maxComment}
                </span>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => handleClose(false)}>
                  {tc("actions.cancel")}
                </Button>
                <Button disabled={!canSubmit} onClick={handleSubmit}>
                  {t("reviews.submit")}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
