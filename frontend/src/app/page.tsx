import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col container mx-auto">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VoteX</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure Online Elections Made Simple
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our platform provides a transparent, secure, and accessible
                    way to conduct elections online. Vote with confidence from
                    anywhere.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-sm space-y-8 rounded-lg border bg-background p-8 shadow-lg">
                      <div className="space-y-2 text-center">
                        <h2 className="text-2xl font-bold">Cast Your Vote</h2>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred candidate
                        </p>
                      </div>
                      <div className="space-y-4">
                        {["Jane Smith", "John Doe", "Alex Johnson"].map(
                          (candidate, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent"
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{candidate}</div>
                                <div className="text-sm text-muted-foreground">
                                  Candidate #{i + 1}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        <Button className="w-full">Submit Vote</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full bg-muted/40 py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why Choose VoteX?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our platform offers everything you need to run secure,
                  transparent elections online.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  icon: <ShieldCheck className="h-10 w-10 text-primary" />,
                  title: "Secure Voting",
                  description:
                    "End-to-end encryption and blockchain verification ensure your votes are secure and tamper-proof.",
                },
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Accessible Anywhere",
                  description:
                    "Vote from any device with internet access, making participation easier for everyone.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10 text-primary" />,
                  title: "Real-time Results",
                  description:
                    "Get instant, transparent results as soon as the election closes.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Our platform makes online voting simple, secure, and
                  accessible in just a few steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-4 lg:gap-12">
              {[
                {
                  step: "01",
                  title: "Register",
                  description:
                    "Create your account with your personal details.",
                },
                {
                  step: "02",
                  title: "Verify Identity",
                  description: "Complete our secure verification process.",
                },
                {
                  step: "03",
                  title: "Access Ballot",
                  description:
                    "Log in during the election period to access your ballot.",
                },
                {
                  step: "04",
                  title: "Cast Vote",
                  description:
                    "Make your selection and submit your secure vote.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col items-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {i < 3 && (
                    <div className="absolute left-[calc(50%+4rem)] top-8 hidden h-0.5 w-[calc(100%-8rem)] bg-border lg:block"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="cta" className="w-full bg-primary py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-5xl">
                  Ready to Transform Your Elections?
                </h2>
                <p className="max-w-[900px] text-primary-foreground/80 md:text-xl/relaxed">
                  Join thousands of organizations already using VoteX for secure
                  online elections.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VoteX</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-sm font-medium hover:underline">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium hover:underline"
            >
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Contact
            </Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VoteX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
