import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
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
              <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: June 13, 2025</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Introduction</h2>
              <p>
                ElectVote ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our online election platform
                ("Service").
              </p>
              <p>
                We take your privacy seriously and have implemented measures designed to protect your personal
                information. Please read this Privacy Policy carefully to understand our practices regarding your
                information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mt-4">2.1 Personal Information</h3>
              <p>We may collect personally identifiable information, such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Mailing address</li>
                <li>Phone number</li>
                <li>Date of birth</li>
                <li>Government-issued identification (for voter verification purposes)</li>
                <li>Other information you provide when creating an account or participating in an election</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">2.2 Non-Personal Information</h3>
              <p>We may also collect non-personal information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type</li>
                <li>Operating system</li>
                <li>IP address</li>
                <li>Device information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
              <p>We may use the information we collect for various purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifying voter identity and eligibility</li>
                <li>Providing and maintaining our Service</li>
                <li>Processing and recording votes</li>
                <li>Generating election results and statistics</li>
                <li>Notifying you about changes to our Service</li>
                <li>Providing customer support</li>
                <li>Monitoring the usage of our Service</li>
                <li>Detecting, preventing, and addressing technical issues</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Ballot Secrecy and Vote Privacy</h2>
              <p>
                We are committed to maintaining the secrecy of your ballot. Our system is designed to separate your
                identity from your voting choices. While we maintain records of who has voted in an election, the
                specific choices made on your ballot cannot be linked back to your identity.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal
                information from unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption of sensitive data</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication procedures</li>
                <li>Secure data storage practices</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                However, please be aware that no method of transmission over the internet or electronic storage is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as necessary to fulfill the purposes outlined
                in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
              <p>
                Election data may be retained for longer periods as required by applicable election laws and
                regulations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to object to processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Third-Party Services</h2>
              <p>
                Our Service may contain links to third-party websites or services that are not owned or controlled by
                ElectVote. We have no control over and assume no responsibility for the content, privacy policies, or
                practices of any third-party websites or services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
              <p>
                Our Service is not intended for use by children under the age of 16 without parental consent. We do not
                knowingly collect personally identifiable information from children under 16. If you are a parent or
                guardian and you are aware that your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                Policy are effective when they are posted on this page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <p className="font-medium">privacy@electvote.com</p>
              <p>ElectVote, Inc.</p>
              <p>123 Secure Street</p>
              <p>Democracy City, DC 10101</p>
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
