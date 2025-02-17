'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Rocket, Code, History, Zap, Github, NewspaperIcon } from 'lucide-react'
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion"

export function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <div className="fixed left-0 right-0 top-0 z-20 border-b bg-background/80 backdrop-blur-sm py-6 px-2 md:p-2">
        <div className="flex h-16 items-center justify-between px-2 md:mx-16">
          <Link href="#top">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 hidden md:block" />
              <span className="text-lg font-semibold">Stellar Contract Invoker</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <ThemeToggle />
            <Link
              target="_blank"
              href="https://github.com/Maycon-Rodrigues/stellar-contract-invoker"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link
              target="_blank"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
              href="https://stellar-contract-invoker.gitbook.io">
              <NewspaperIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Changelog</span>
            </Link>
            <Button variant="default" asChild>
              <Link href="/invoker">
                Launch App
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      <main className="flex-1 pt-20 md:pt-16">
        <section className="flex-1 space-y-6 py-12 text-center md:py-24 lg:py-32 p-4">
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4">
              <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
                Invoke Stellar Smart Contracts with Ease
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                A powerful, user-friendly interface for interacting with smart contracts on the Stellar network. Test, debug, and execute contract functions seamlessly.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/invoker">
                    Get Started
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="flex-1 py-20 md:py-24 lg:py-32 p-4" id="features">
          <motion.div
            key="section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/sci.png"
                alt="Stellar Contract Invoker Interface"
                width={600}
                height={400}
                className="rounded-lg border bg-card shadow-xl"
                priority
              />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Intuitive Interface</h2>
                <p className="text-lg text-muted-foreground">
                  Our clean and user-friendly interface makes it simple to interact with Stellar smart contracts. No complex tooling required.
                </p>
                <ul className="grid gap-4">
                  <li className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-primary" />
                    <span>Easy contract function execution</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <History className="h-5 w-5 text-primary" />
                    <span>Transaction history tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Real-time response monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="flex-1 border-t bg-muted/50">
          <motion.div
            key="section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="items-center py-12 md:py-24 lg:py-32 p-4">
              <div className="mx-auto max-w-6xl text-center">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Ready to streamline your Stellar development?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Start invoking smart contracts with our easy-to-use interface
                </p>
                <Button size="lg" className="mt-8" asChild>
                  <Link href="/invoker">
                    Launch App Now
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t">
        <motion.div
          key="footer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0 ml-16 mr-16">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Rocket className="h-6 w-6" />
              <p className="text-center text-sm leading-loose md:text-left">
                Built for the Stellar developer community.
              </p>
            </div>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              Open source project. MIT License.
            </p>
          </div>
        </motion.div>
      </footer>
    </div >
  )
}

