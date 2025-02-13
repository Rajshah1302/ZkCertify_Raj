"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, CheckCircle, XCircle } from "lucide-react";
import { useWeb3 } from "@/providers/web3-provider";

interface VerificationResult {
  success: boolean;
  verificationHash?: string;
  error?: string;
}

interface Verification {
  studentId: string;
  timestamp: string;
  network: string;
}

export default function VerifyPage() {
  const backendURL = "http://localhost:4000";
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId") || "";
  const [studentId, setStudentId] = useState(initialStudentId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [recentVerifications, setRecentVerifications] = useState<
    Verification[]
  >([]);
  const [isVerifyingArb, setIsVerifyingArb] = useState(false);
  const [isVerifyingEdu, setIsVerifyingEdu] = useState(false);
  const { connectWallet, chainId, provider } = useWeb3();
  const ARBITRUM_TESTNET_CHAIN_ID = 421614;
  const EDUCHAIN_TESTNET_CHAIN_ID = 656476;

  const handleArbitrumVerify = async () => {
    setIsVerifyingArb(true);
    setIsVerifying(true);
    if (!provider) {
      await connectWallet();
    }
    if (chainId !== ARBITRUM_TESTNET_CHAIN_ID) {
      try {
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${ARBITRUM_TESTNET_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum!.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${ARBITRUM_TESTNET_CHAIN_ID.toString(16)}`,
                  chainName: "Arbitrum Sepolia Testnet",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
                  blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Arbitrum Testnet:", addError);
            return;
          }
        } else {
          console.error("Failed to switch to Arbitrum Testnet:", switchError);
          return;
        }
      }
    }
    try {
      await handleVerify("Arbitrum");
    } finally {
      setIsVerifyingArb(false);
      setIsVerifying(false);
    }
  };

  const handleEDUCHAINVerify = async () => {
    setIsVerifyingEdu(true);
    setIsVerifying(true);
    if (!provider) {
      await connectWallet();
    }
    if (chainId !== EDUCHAIN_TESTNET_CHAIN_ID) {
      try {
        await window.ethereum!.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${EDUCHAIN_TESTNET_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum!.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${EDUCHAIN_TESTNET_CHAIN_ID.toString(16)}`,
                  chainName: "EDUCHAIN Testnet",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                  blockExplorerUrls: [
                    "https://opencampus-codex.blockscout.com",
                  ],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add EDUCHAIN Testnet:", addError);
            return;
          }
        } else {
          console.error("Failed to switch to EDUCHAIN Testnet:", switchError);
          return;
        }
      }
    }
    try {
      await handleVerify("EDUCHAIN");
    } finally {
      setIsVerifyingEdu(false);
      setIsVerifying(false);
    }
  };

  const handleVerify = async (network: "Arbitrum" | "EDUCHAIN") => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      // Fetch the network name from MetaMask
      const network = await window
        .ethereum!.request({ method: "eth_chainId" })
        .then((chainId: string) => {
          switch (Number.parseInt(chainId, 16)) {
            case ARBITRUM_TESTNET_CHAIN_ID:
              return "Arbitrum";
            case EDUCHAIN_TESTNET_CHAIN_ID:
              return "EDUCHAIN";
            default:
              return "Unknown Network";
          }
        });

      const response = await fetch(`${backendURL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, network }),
      });

      const result = await response.json();
      setVerificationResult(result);
      if (result.success) {
        loadVerifications();
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        error: "An error occurred during verification.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const loadVerifications = async () => {
    try {
      const response = await fetch(`${backendURL}/verifications`);
      const verifications = await response.json();
      setRecentVerifications(verifications);
    } catch (error) {
      console.error("Failed to load recent verifications:", error);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [studentId]);

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
            <h1 className="text-2xl font-bold text-center mb-6">
              CGPA Verification
            </h1>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium mb-2"
                >
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
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={handleArbitrumVerify}
                  disabled={!studentId || isVerifying}
                  className="flex-1 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
                >
                  {isVerifyingArb ? "Verifying..." : "Verify in Arbitrum"}
                </Button>
                <Button
                  type="button"
                  onClick={handleEDUCHAINVerify}
                  disabled={!studentId || isVerifying}
                  className="flex-1 bg-gradient-to-r from-cyber-pink to-cyber-purple hover:opacity-90 text-white"
                >
                  {isVerifyingEdu ? "Verifying..." : "Verify in EDUCHAIN"}
                </Button>
              </div>
            </form>

            {verificationResult && (
              <div
                className={`mt-4 p-4 rounded-md ${
                  verificationResult.success
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {verificationResult.success ? (
                  <>
                    <h3 className="flex items-center text-lg font-semibold mb-2">
                      <CheckCircle className="mr-2" /> Verification Successful!
                    </h3>
                    <p>CGPA is above threshold.</p>
                    <small>
                      Verification Hash: {verificationResult.verificationHash}
                    </small>
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
                <h3 className="text-xl font-semibold mb-4">
                  Recent Verifications
                </h3>
                {recentVerifications.map((v, index) => (
                  <div
                    key={index}
                    className="bg-green-100 text-green-800 p-4 rounded-md mb-2"
                  >
                    <p>Student ID: {v.studentId}</p>
                    <p>Verified: {new Date(v.timestamp).toLocaleString()}</p>
                    <p>Network: {v.network}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
