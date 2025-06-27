import { verifyEmail } from "@/actions/auth.action";
import ResendVerificationMail from "@/components/resend-verification-mail";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const { token } = await searchParams;
  const resp = await verifyEmail(token);

  if (resp.error) {
    return <ResendVerificationMail error={resp.error} />;
  }

  redirect("/login?message=Email verified successfully");
}
