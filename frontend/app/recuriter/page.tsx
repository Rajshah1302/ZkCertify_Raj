"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Application {
  studentId: string;
  techSkills: string[];
  timestamp: string;
}

export default function RecruiterPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const router = useRouter();
  const backendURL = "http://localhost:4000";

  const loadApplications = async () => {
    try {
      const response = await fetch(`${backendURL}/applications`);
 const apps: Application[] = [];
      for (let i = 1; i <= 10; i++) {
        apps.push({
          studentId: `student${i}`,
          techSkills: ["React"],
          timestamp: new Date().toISOString(),
        });
      }
      apps.push( {
        studentId: "student11",
        techSkills: ["Python", "Django"],
        timestamp: new Date().toISOString(),
      });      setApplications(apps);
      setFilteredApps(apps);
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const uniqueSkills = ["All", ...new Set(applications.flatMap((app) => app.techSkills))];

  useEffect(() => {
    if (selectedSkill === "All") {
      setFilteredApps(applications);
    } else {
      setFilteredApps(applications.filter((app) => app.techSkills.includes(selectedSkill)));
    }
  }, [selectedSkill, applications]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#0d0d0d] to-[#121212] p-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-3xl font-bold text-white mb-6">
          Student Applications
        </h1>

        {/* Filter Dropdown */}
        <div className="mb-6 flex justify-center">
          <select
            className="border border-gray-700 rounded-lg p-2 bg-[#1a1a1a] text-white shadow-md"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            {uniqueSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Student Applications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredApps.map((app, index) => (
            <div
              key={index}
              onClick={() => router.push(`/recruiter/verify?studentId=${app.studentId}`)}
              className="bg-[#1a1a1a] text-white border border-gray-700 rounded-lg shadow-lg p-4 cursor-pointer 
                        hover:shadow-[0_0_10px_#00ccff] transition-all duration-300"
            >
              <p className="font-bold text-lg">Student ID: {app.studentId}</p>
              <p className="text-sm text-gray-400">Tech Skills: {app.techSkills.join(", ")}</p>
              <p className="text-xs text-gray-500">
                Applied: {new Date(app.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
