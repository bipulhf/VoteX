"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { resendVerificationMail } from "@/actions/auth.action";

export default function ResendVerificationMail({ error }: { error: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const resp = await resendVerificationMail(email);
    if (resp.error) {
      toast.error(resp.error);
      setIsLoading(false);
    } else {
      toast.success("Verification mail sent");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col container mx-auto">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Link href="/" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">VoteX</span>
            </Link>
            <h1 className="text-3xl font-bold">Resend Verification Mail</h1>
            <p className="text-muted-foreground">
              Enter your email to resend the verification mail
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              Resend Verification Mail
            </Button>
          </form>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-center gap-2 text-center md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VoteX. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
