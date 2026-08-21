import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Mengenal UNINUS Press, unit penerbitan Universitas Islam Nusantara yang melayani penerbitan buku secara transparan dan terpercaya.",
};

export default function TentangPage() {
  return (
    <>
      <PageHero
        title="Tentang Kami"
        subtitle="Mengenal UNINUS Press sebagai unit penerbitan Universitas Islam Nusantara."
      />

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading
          title="UNINUS Press"
          subtitle="Menerbitkan karya ilmu pengetahuan untuk kemaslahatan umat."
        />
        <div className="mt-10 space-y-6 text-lg leading-relaxed text-gray-700">
          <p>
            UNINUS Press adalah unit penerbitan yang berada di lingkungan
            Universitas Islam Nusantara (UNINUS) Bandung. Berlandaskan nilai-nilai
            Ahlussunnah wal Jama&apos;ah An-Nahdliyah, UNINUS Press hadir untuk
            mendukung pengembangan ilmu pengetahuan melalui penerbitan buku yang
            bermutu dan berintegritas.
          </p>
          <p>
            Kami melayani pengajuan penerbitan buku bagi dosen, peneliti,
            mahasiswa, dan masyarakat umum. Dengan sistem pengajuan daring yang
            transparan, setiap penulis dapat memantau perkembangan penerbitan
            bukunya secara real-time — mulai dari verifikasi dokumen, review
            pelaksana, proses layouting, hingga pengusulan ke Perpustakaan
            Nasional.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Visi", desc: "Menjadi penerbit kampus yang unggul dan terpercaya dalam menyebarluaskan karya ilmiah." },
            { title: "Misi", desc: "Menerbitkan karya berkualitas, membina penulis, dan mendukung tri dharma perguruan tinggi." },
            { title: "Nilai", desc: "Integritas, transparansi, dan mutu dalam setiap proses penerbitan." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
            >
              <h3 className="inline-block border-b-2 border-uninus-yellow pb-1 text-lg font-bold text-uninus-dark">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-uninus-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Tim Redaksi"
            subtitle="Para profesional yang mendampingi setiap naskah hingga terbit."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Prof. Dr. H. Deded Setiadi, S.Pd., M.T.", role: "Penanggung Jawab", initial: "DS" },
              { name: "Dr. H. Ahmad Fauzi, M.Ag.", role: "Ketua Redaksi", initial: "AF" },
              { name: "Siti Rahmawati, S.S., M.Hum.", role: "Editor Penyelia", initial: "SR" },
              { name: "Rizky Ramadhan, S.Ds.", role: "Layouter", initial: "RR" },
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-uninus text-xl font-extrabold text-white">
                  {member.initial}
                </div>
                <h3 className="mt-4 text-sm font-bold leading-snug text-gray-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-uninus">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}