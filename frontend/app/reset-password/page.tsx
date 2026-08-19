import { Suspense } from "react";
import ResetForm from "./ResetForm";

export const metadata = {
  title: "Reset Password",
};

export default function Page() {
  return (
    <Suspense fallback={<p>Memuat...</p>}>
      <ResetForm />
    </Suspense>
  );
}