import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi UNINUS Press untuk konsultasi penerbitan buku. Alamat: Jl. Soekarno-Hatta No.530, Bandung. Email: press@uninus.ac.id.",
};

export default function KontakPage() {
  return (
    <>
      <PageHero
        title="Hubungi Kami"
        subtitle="Punya pertanyaan seputar penerbitan buku? Tim UNINUS Press siap membantu."
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Informasi Kontak
            </h2>
            <div className="mt-8 space-y-6">
              {[
                { label: "Alamat", value: "Jl. Soekarno-Hatta No.530, Bandung, Jawa Barat 40286" },
                { label: "Email", value: "press@uninus.ac.id" },
                { label: "Telepon / WhatsApp", value: "0811-2311-530" },
                { label: "Jam Kerja", value: "Senin - Jumat, 08.00 - 16.00 WIB" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-uninus-soft text-uninus">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-1 font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-gray-200 shadow-sm">
              <div className="flex aspect-[16/9] items-center justify-center bg-gray-100 text-center text-sm text-gray-500">
                <div>
                  <p className="mb-1 font-semibold text-gray-600">Lokasi UNINUS Press</p>
                  <p>Jl. Soekarno-Hatta No.530, Bandung</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Kirim Pesan
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Isi formulir di bawah ini, tim kami akan merespons dalam 1-2 hari
              kerja.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}