import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Briefcase, GraduationCap } from "lucide-react";

const appliedStudents = [
  {
    id: "student1",
    name: "Alice Johnson",
    role: "Software Engineer",
    university: "MIT",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "student2",
    name: "Bob Smith",
    role: "Data Scientist",
    university: "Stanford",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "student3",
    name: "Charlie Brown",
    role: "UX Designer",
    university: "Harvard",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function RecruiterDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2" />
            Applied Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {appliedStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg shadow"
              >
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-1 h-4 w-4" />
                      {student.role}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <GraduationCap className="mr-1 h-4 w-4" />
                      {student.university}
                    </div>
                  </div>
                </div>
                <div className="ml-auto">
                  <Link
                    href={`/recuriter/verify?studentId=${student.id}`}
                    passHref
                  >
                    <Button variant="outline">Verify Profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
