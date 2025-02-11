"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const stats = [
  {
    title: "Total Value Locked",
    value: "$1.2B",
    change: "+12.3%",
    positive: true,
  },
  {
    title: "Active Users",
    value: "127.4K",
    change: "+8.1%",
    positive: true,
  },
  {
    title: "Transactions",
    value: "5.2M",
    change: "+15.6%",
    positive: true,
  },
]

export function Stats() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section className="py-24 bg-gradient-to-b from-background to-background/80">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm"
            >
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{stat.title}</h3>
              <div className="flex items-baseline space-x-4">
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

