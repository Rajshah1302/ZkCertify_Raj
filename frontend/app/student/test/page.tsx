"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [selectedTechnology, setSelectedTechnology] = useState<string>("");
  const [customTechnology, setCustomTechnology] = useState<string>("");
  const router = useRouter();

  const technologies = {
    react: "React.js",
    nodejs: "Node.js",
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    go: "Go",
    rust: "Rust",
    ruby: "Ruby on Rails",
    java: "Java",
    csharp: "C#",
    cpp: "C++",
    solidity: "Solidity",
    swift: "Swift",
    kotlin: "Kotlin",
    php: "PHP",
  };

  const handleStartTest = () => {
    const tech = selectedTechnology || customTechnology;
    if (tech) {
      router.push(`/student/test/${tech}`);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Skill Assessment</CardTitle>
          <CardDescription>
            Select a skill to start the assessment.
            <br /> Integrated with the Llama-3.3-70B-Versatile AI model to create
            personalized tests tailored to each user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedTechnology}
            onValueChange={setSelectedTechnology}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a skill" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(technologies).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Or enter a custom skill"
              value={customTechnology}
              onChange={(e) => setCustomTechnology(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleStartTest}
            disabled={!selectedTechnology && !customTechnology}
          >
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
