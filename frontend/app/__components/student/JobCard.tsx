import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface JobCardProps {
  title: string
  company: string
  type: string
  salary: string
  remote?: boolean
}

export function JobCard({ title, company, type, salary, remote }: JobCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm font-medium">{salary}</span>
        </div>
        <p className="text-sm text-muted-foreground">{company}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded">{type}</span>
            {remote && <span className="text-xs bg-muted px-2 py-1 rounded">Remote</span>}
          </div>
          <Button variant="secondary" size="sm">
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

