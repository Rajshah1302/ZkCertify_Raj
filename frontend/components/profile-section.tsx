"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"
import { Camera, Edit2, Save } from "lucide-react"
import Image from "next/image"

export function ProfileSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Alex Thompson",
    bio: "Blockchain enthusiast and privacy advocate. Working on zero-knowledge applications to enhance digital privacy.",
    email: "alex@example.com",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save the profile changes to your backend
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background/80 to-background">
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-10 blur-xl rounded-lg" />
            <div className="relative p-6 bg-card/50 backdrop-blur-sm rounded-lg border">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-cyber-blue">
                    <Image src="/placeholder.svg" alt="Profile" fill className="object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-cyber-blue rounded-full text-white hover:opacity-90">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-full space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <Textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-center">{profile.name}</h2>
                      <p className="text-muted-foreground text-center">{profile.bio}</p>
                      <p className="text-cyber-blue text-center">{profile.email}</p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      if (isEditing) {
                        handleSave()
                      } else {
                        setIsEditing(true)
                      }
                    }}
                    className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
                  >
                    {isEditing ? (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Profile
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

