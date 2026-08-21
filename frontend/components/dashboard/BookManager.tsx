"use client";

import { useState } from "react";
import type { Submission } from "@/lib/types";

interface BookManagerProps {
  token: string;
  submissions: Submission[];
}

export default function BookManager({
  token,
  submissions,
}: BookManagerProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Hanya submission dengan hasil Perpusnas yang bisa dijadikan buku toko
  const completed = submissions.filter(
    (s) =>
      s.current_stage === "PERPUSNAS_RESULT_RECEIVED" ||
      s.current_stage === "COMPLETED",
  );

  if (completed.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Belum ada buku yang siap diterbitkan di toko.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {success}
        </div>
      )}
      {completed.map((s) => (
        <div
          key={s.id}
          className="flex flex-wrap items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{s.title}</p>
            <p className="text-xs text-gray-500">
              {s.author_name} — {s.current_status}
            </p>
          </div>
          <span className="rounded-full bg-uninus-soft px-3 py-1 text-xs font-semibold text-uninus">
            {s.current_stage === "COMPLETED" ? "Selesai" : "Siap"}
          </span>
        </div>
      ))}
    </div>
  );
}