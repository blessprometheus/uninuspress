"use client";

import { useEffect, useMemo, useState } from "react";
import { actionLabel } from "@/lib/labels";
import type { Submission } from "@/lib/types";

const SEEN_KEY = "uninus_notif_seen_at";

/**
 * Event yang masuk notification center.
 * Sumber kebenaran: docs/requirements.md #12.
 */
const NOTIF_ACTIONS = new Set([
  "SUBMITTED",
  "REVISION_REQUESTED",
  "APPROVED_AND_ASSIGNED",
  "EXECUTOR_UPLOAD",
  "LAYOUT_COMPLETED",
  "PERPUSNAS_RESULT_RECEIVED",
]);

interface NotifItem {
  id: number;
  title: string;
  text: string;
  detail: string | null;
  at: string;
}

interface NotificationsPanelProps {
  submissions: Submission[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPanel({
  submissions,
}: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastSeenMs, setLastSeenMs] = useState(0);

  useEffect(() => {
    setLastSeenMs(Number(localStorage.getItem(SEEN_KEY) ?? 0));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = useMemo<NotifItem[]>(() => {
    const out: NotifItem[] = [];
    for (const s of submissions) {
      for (const h of s.history ?? []) {
        if (!NOTIF_ACTIONS.has(h.action)) continue;
        out.push({
          id: h.id,
          title: s.title,
          text: actionLabel(h.action),
          detail:
            h.action === "REVISION_REQUESTED" && h.note ? h.note : null,
          at: h.performed_at,
        });
      }
    }
    return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [submissions]);

  const unreadCount = mounted
    ? items.filter((i) => new Date(i.at).getTime() > lastSeenMs).length
    : 0;

  function toggle() {
    if (!open) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setLastSeenMs(now);
    }
    setOpen((v) => !v);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uninus focus-visible:ring-offset-2"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
        aria-expanded={open}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-ink/10 bg-white shadow-lg"
            role="dialog"
            aria-label="Daftar notifikasi"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="font-display text-base font-semibold text-ink">
                Notifikasi
              </p>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Belum ada notifikasi. Aktivitas pengajuan Anda akan tampil di
                sini.
              </p>
            ) : (
              <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">{item.text}</p>
                    {item.detail && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">
                        {item.detail}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formatTime(item.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
