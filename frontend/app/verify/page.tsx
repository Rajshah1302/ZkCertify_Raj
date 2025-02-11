"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Badge, CheckCircle, XCircle } from "lucide-react"

interface VerificationResult {
  success: boolean
  verificationHash?: string
  error?: string
}

interface Verification {
  studentId: string
  timestamp: string
}

export default function VerifyPage() {
  const [studentId, setStudentId] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [recentVerifications, setRecentVerifications] = useState<Verification[]>([])
  
  const backendURL = "http://localhost:4000"

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setVerificationResult(null)
    try {
      const response = await fetch(`http://localhost:4000/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      })

      const result = await response.json()
      setVerificationResult(result)
      if (result.success) {
        loadVerifications()
      }
    } catch (error) {
      setVerificationResult({ success: false, error: "An error occurred during verification." })
    } finally {
      setIsVerifying(false)
    }
  }

  const loadVerifications = async () => {
    try {
      const response = await fetch(`${backendURL}/verifications`)
      const verifications = await response.json()
      setRecentVerifications(verifications)
    } catch (error) {
      console.error("Failed to load recent verifications:", error)
    }
  }

  // useEffect(() => {
  //   loadVerifications()
  // }, []) //Fixed useEffect dependency

  return (
    <div className="min-h-screen pt-16 pb-12 flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-10 blur-xl" />
          <div className="relative bg-card border rounded-lg shadow-lg p-6">
            <div className="flex justify-center mb-6">
              <Badge className="h-12 w-12 text-cyber-blue" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">CGPA Verification</h1>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium mb-2">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!studentId || isVerifying}
                className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </form>

            {verificationResult && (
              <div
                className={`mt-4 p-4 rounded-md ${verificationResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {verificationResult.success ? (
                  <>
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <CheckCircle className="mr-2" /> Verification Successful!
                    </h3>
                    <p>CGPA is above threshold.</p>
                    <small>Verification Hash: {verificationResult.verificationHash}</small>
                  </>
                ) : (
                  <>
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <XCircle className="mr-2" /> Verification Failed
                    </h3>
                    <p>{verificationResult.error}</p>
                  </>
                )}
              </div>
            )}

            {recentVerifications.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Recent Verifications</h3>
                {recentVerifications.map((v, index) => (
                  <div key={index} className="bg-green-100 text-green-800 p-4 rounded-md mb-2">
                    <p>Student ID: {v.studentId}</p>
                    <p>Verified: {new Date(v.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

