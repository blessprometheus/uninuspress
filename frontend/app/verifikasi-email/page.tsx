import { Suspense } from "react";
import VerifyForm from "./VerifyForm";

export const metadata = {
  title: "Verifikasi Email",
};

export default function Page() {
  return (
    <Suspense fallback={<p>Memuat...</p>}>
      <VerifyForm />
    </Suspense>
  );
}