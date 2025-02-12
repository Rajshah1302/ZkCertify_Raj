"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [selectedTechnology, setSelectedTechnology] = useState<string>("")
  const router = useRouter()

  const handleStartTest = () => {
    if (selectedTechnology) {
      router.push(`/student/test/${selectedTechnology}`)
    }
  }

  return (
    <div className="container mx-auto mt-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Skill Assessment</CardTitle>
          <CardDescription>Select a technology to start the assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
            <SelectTrigger>
              <SelectValue placeholder="Select a technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="nodejs">Node.js</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTest} disabled={!selectedTechnology}>
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

