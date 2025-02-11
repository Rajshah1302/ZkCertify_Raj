import { DollarSign, Users, Trophy, Calendar } from "lucide-react";
import { JobCard } from "../__components/student/JobCard";
import { StatsCard } from "../__components/student/StatsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4 w-full">
        <div className="flex-1 space-y-4">
          <StatsCard
            title="Market Overview"
            value="$2.1T"
            change="+5.2%"
            icon={<DollarSign className="h-4 w-4 text-green-500" />}
          />
          <StatsCard
            title="Active Jobs"
            value="1,234"
            change="+12%"
            icon={<Users className="h-4 w-4 text-blue-500" />}
          />
        </div>
        <div className="flex-1 space-y-4">
          <StatsCard
            title="Skills in Demand"
            value="Solidity"
            subtitle="Top Skill"
            icon={<Trophy className="h-4 w-4 text-purple-500" />}
          />
          <StatsCard
            title="Upcoming Events"
            value="8"
            subtitle="This Week"
            icon={<Calendar className="h-4 w-4 text-orange-500" />}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 my-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Latest Jobs</h2>
          <div className="space-y-4">
            <JobCard
              title="Senior Solidity Developer"
              company="DeFi Protocol"
              type="Smart Contract"
              salary="$120k - $180k"
              remote
            />
            <JobCard
              title="Smart Contract Auditor"
              company="Security First"
              type="Security"
              salary="$140k - $200k"
              remote
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Industry News</h2>
          <div className="space-y-4">{/* News cards would go here */}</div>
        </div>
      </div>
    </div>
  );
}
