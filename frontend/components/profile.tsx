"use client";

import { useState } from "react";
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

export function ProfilePage() {
  // Profile state
  const [user, setUser] = useState({
    name: "Anonymous User",
    wallet: "0x720f...698b",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    portfolio: "",
  });

  // Edit Profile modal state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

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
      // Request the PDF from the backend endpoint
      const response = await axios.get('http://localhost:4000/certificate/generate', {
        responseType: 'blob', // ensures the response is treated as binary data
      });
      
      // Create a blob from the PDF data
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
  
      // Option 1: Open the PDF in a new browser tab
      window.open(fileURL);
      
      // Option 2: Trigger a download of the PDF
      // const link = document.createElement('a');
      // link.href = fileURL;
      // link.setAttribute('download', 'zkCertificate.pdf');
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
