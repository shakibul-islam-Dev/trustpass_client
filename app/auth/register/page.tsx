import RegistrationForm from "@/components/auth/RegistrationForm";


import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Create Account",
  "Create a TrustPass account to connect with verified businesses and products.",
);

export default function Registration() {
  return <RegistrationForm />;
}


