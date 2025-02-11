"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Shield, Lock, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Enhanced Privacy",
    description:
      "Zero-knowledge proofs allow users to verify information without revealing sensitive data, ensuring maximum privacy in all transactions.",
  },
  {
    icon: Lock,
    title: "Secure Verification",
    description:
      "Our ZK-based system enables secure verification of credentials while keeping your personal information completely confidential.",
  },
  {
    icon: Zap,
    title: "Efficient Processing",
    description:
      "Advanced ZK-SNARK technology provides fast, efficient verification while maintaining the highest level of security.",
  },
]

export function ProjectDetails() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/80">
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Zero-Knowledge Technology</h2>
            <p className="max-w-[900px] mx-auto text-muted-foreground text-lg">
              Our platform leverages cutting-edge zero-knowledge proof technology to provide unparalleled privacy and
              security while maintaining full transparency and trust.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-0 group-hover:opacity-10 blur-xl transition-opacity rounded-lg" />
                <div className="relative p-6 bg-card/50 backdrop-blur-sm rounded-lg border space-y-4">
                  <feature.icon className="h-8 w-8 text-cyber-blue" />
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
            <h3 className="text-xl font-bold mb-4">How Zero-Knowledge Proofs Work</h3>
            <p className="text-muted-foreground">
              Zero-knowledge proofs are cryptographic methods that allow one party (the prover) to prove to another
              party (the verifier) that a statement is true without revealing any information beyond the validity of the
              statement itself. This revolutionary technology enables our platform to verify user credentials and
              process transactions while maintaining complete privacy and security.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

