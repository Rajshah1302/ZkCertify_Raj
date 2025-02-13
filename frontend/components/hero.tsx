"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HeroScene } from "./hero-scene";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
            ZkCertify: Verifiable Resume Credentials
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-muted-foreground">
            Empower your career with tamper-proof certifications. ZkCertify uses
            cutting-edge zero-knowledge proofs to verify and certify your resume
            data without compromising your privacy—making hiring and recruiting
            more transparent and trustworthy.
          </p>
          <Link href="/student" className="mx-2">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
            >
              Student
            </Button>
          </Link>
          <Link href="/recruiter" className="mx-2">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
            >
              Recruiter
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="text-cyber-blue"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
