"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, Linkedin, Mail, MapPin, Edit, Plus } from "lucide-react";

export function ProfilePage() {
  const [user] = useState({
    name: "Anonymous User",
    wallet: "0x720f...698b",
    bio: "No bio provided yet.",
    location: "Remote",
    email: "Not provided",
    github: "",
    linkedin: "",
    portfolio: "",
    experience: [
      {
        title: "Smart Contract Developer",
        company: "DeFi Protocol",
        period: "2023 - Present",
        description: "Developing and auditing smart contracts for DeFi applications"
      }
    ],
    education: [
      {
        degree: "MSc in Computer Science",
        school: "Tech University",
        year: "2022",
        focus: "Blockchain Technology"
      }
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="relative">
          {/* Profile Avatar */}
          <div className="absolute -top-16">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold border-4 border-background">
              {user.name.charAt(0)}
            </div>
          </div>

          {/* Profile Actions */}
          <div className="ml-36 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.wallet}</p>
            </div>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column - Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{user.bio}</p>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {user.location}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" disabled={!user.github}>
                  <Github className="h-4 w-4 mr-2" />
                  {user.github || "No GitHub provided"}
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled={!user.linkedin}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  {user.linkedin || "No LinkedIn provided"}
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled={!user.portfolio}>
                  <Globe className="h-4 w-4 mr-2" />
                  {user.portfolio || "No Portfolio provided"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Experience & Education */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Experience</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.experience.map((exp, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <Badge variant="secondary">{exp.period}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Education</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.education.map((edu, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.school}</p>
                      </div>
                      <Badge variant="secondary">{edu.year}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Focus: {edu.focus}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
