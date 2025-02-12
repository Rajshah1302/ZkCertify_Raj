"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Edit,
  Plus,
} from "lucide-react";
import axios from "axios";

// Default values in case nothing is stored yet.
const defaultUser = {
  name: "Anonymous User",
  wallet: "0x720f...698b",
  bio: "",
  email: "",
  github: "",
  linkedin: "",
  portfolio: "",
};

export function ProfilePage() {
  // Lazy initialization for user state from localStorage
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("profileUser");
      return storedUser ? JSON.parse(storedUser) : defaultUser;
    }
    return defaultUser;
  });

  // Lazy initialization for skills state from localStorage
  const [skills, setSkills] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const storedSkills = localStorage.getItem("profileSkills");
      return storedSkills ? JSON.parse(storedSkills) : [];
    }
    return [];
  });

  // Separate state for modal editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [newSkill, setNewSkill] = useState("");

  // Persist user profile data whenever it changes
  useEffect(() => {
    localStorage.setItem("profileUser", JSON.stringify(user));
  }, [user]);

  // Persist skills data whenever it changes
  useEffect(() => {
    localStorage.setItem("profileSkills", JSON.stringify(skills));
  }, [skills]);

  // Handlers for profile edit and skills management
  const handleEditClick = () => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleGenerateResume = async () => {
    try {
      const userDetails = {
        name: user.name,
        wallet: user.wallet,
        bio: user.bio,
        email: user.email,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        skills: skills,
      };

      // Request the PDF from the backend endpoint with user data
      const response = await axios.get("http://localhost:4000/certificate/generate", {
        params: userDetails,
        responseType: "blob",
      });

      // Create a blob from the PDF data and open it in a new tab
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

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

          {/* Top Profile Section */}
          <div className="ml-36 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.wallet}</p>
            </div>
            <Button onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="mt-8 space-y-6">
          {/* Links Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!user.github}
              >
                <Github className="h-4 w-4 mr-2" />
                {user.github || "No GitHub provided"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!user.linkedin}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                {user.linkedin || "No LinkedIn provided"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!user.portfolio}
              >
                <Globe className="h-4 w-4 mr-2" />
                {user.portfolio || "No Portfolio provided"}
              </Button>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.length > 0 ? (
                <ul className="list-disc ml-5">
                  {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>No skills added yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Generate Resume Button */}
          <div className="flex justify-center">
            <Button onClick={handleGenerateResume} className="w-full">
              Generate Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              placeholder="GitHub"
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
            />
            <Input
              placeholder="LinkedIn"
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
            />
            <Input
              placeholder="Portfolio"
              value={formData.portfolio}
              onChange={(e) =>
                setFormData({ ...formData, portfolio: e.target.value })
              }
            />
            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
