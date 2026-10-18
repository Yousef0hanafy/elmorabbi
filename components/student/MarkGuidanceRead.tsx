"use client";

import { useEffect } from "react";
import { markGuidanceReadAction } from "@/lib/actions/log-actions";

// Marks the student's guidance as read once the page has been shown. "New" labels stay
// visible for this visit because the page data was loaded before the update.
export function MarkGuidanceRead({ hasUnread }: { hasUnread: boolean }) {
  useEffect(() => {
    if (hasUnread) {
      void markGuidanceReadAction();
    }
  }, [hasUnread]);
  return null;
}
