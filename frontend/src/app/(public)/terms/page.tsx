import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col container mx-auto">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ElectVote</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
              Login
            </Link>
            <Link href="/register" className="text-sm font-medium transition-colors hover:text-primary">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="space-y-8">
            <div>
              <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: June 13, 2025</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the ElectVote platform ("Service"), you agree to be bound by these Terms of
                Service. If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of Service</h2>
              <p>
                ElectVote provides an online platform for conducting secure electronic voting and elections. The Service
                includes voter registration, identity verification, ballot creation, vote casting, and result
                tabulation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. User Accounts</h2>
              <p>
                To use certain features of the Service, you must register for an account. You must provide accurate and
                complete information and keep your account information updated. You are responsible for maintaining the
                security of your account and password. ElectVote cannot and will not be liable for any loss or damage
                from your failure to comply with this security obligation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Voter Eligibility and Verification</h2>
              <p>
                Users must meet the eligibility requirements specified for each election to participate as voters.
                ElectVote reserves the right to verify voter identity and eligibility through various means, which may
                include requesting government-issued identification or other verification methods.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Prohibited Activities</h2>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Attempting to interfere with, compromise the system integrity or security, or decipher any
                  transmissions to or from the servers running the Service
                </li>
                <li>Using the Service for any fraudulent or illegal purpose</li>
                <li>Attempting to impersonate another user or person</li>
                <li>Attempting to manipulate election results or cast multiple votes</li>
                <li>Using any robot, spider, crawler, scraper, or other automated means to access the Service</li>
                <li>Selling or transferring your account or voter credentials</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive
                property of ElectVote and its licensors. The Service is protected by copyright, trademark, and other
                laws. Our trademarks and trade dress may not be used in connection with any product or service without
                the prior written consent of ElectVote.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever, including but not limited to a
                breach of the Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
              <p>
                In no event shall ElectVote, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
                to or use of or inability to access or use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p className="font-medium">support@electvote.com</p>
            </section>
          </div>
        </div>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ElectVote</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-sm font-medium hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm font-medium hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Contact
            </Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ElectVote. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
