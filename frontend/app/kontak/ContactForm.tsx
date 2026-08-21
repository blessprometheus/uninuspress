"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl bg-uninus-soft p-6 text-center">
        <p className="text-lg font-bold text-uninus-dark">
          Pesan Anda terkirim!
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Terima kasih, {form.name || "Sobat UNINUS Press"}. Tim kami akan
          segera menghubungi Anda.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-gray-700"
        >
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-uninus"
          placeholder="Nama Anda"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-uninus"
          placeholder="nama@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-gray-700"
        >
          Pesan
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-uninus"
          placeholder="Tulis pesan Anda..."
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-uninus px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-uninus-dark"
      >
        Kirim Pesan
      </button>
    </form>
  );
}