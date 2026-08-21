"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface NotificationsPanelProps {
  token: string;
}

// Gunakan tipe history ringan atau polling sederhana.
// Untuk MVP, kita polling dari submission history terbaru.
// Nanti bisa diganti endpoint notifikasi terpisah.

export default function NotificationsPanel({ token }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<
    { id: number; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (!open || !token) return;
    // Untuk sementara polling history dari submission user sendiri.
    // Bisa ditingkatkan dengan endpoint notifikasi khusus nanti.
    api<{ data: { history?: { id: number; action: string; performed_at: string; actor?: { name: string } | null }[] } }>(
      "/submissions?per_page=5",
      { token },
    )
      .then((res) => {
        // Notifikasi sederhana: count didasarkan pada ada/tidaknya history
        const total = 0;
        setCount(total);
      })
      .catch(() => undefined);
  }, [open, token]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
        aria-label="Notifikasi"
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
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">Notifikasi</p>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto p-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {item.text}
                    <span className="block text-xs text-gray-400">
                      {item.time}
                    </span>
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