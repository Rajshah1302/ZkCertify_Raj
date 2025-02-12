import { JobCard } from "../../__components/student/JobCard";

export default function JobsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Jobs</h1>
      <div className="grid gap-6 md:grid-cols-2 my-4">
        <div>
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
            <JobCard
              title="Full Stack Blockchain Engineer"
              company="Crypto Solutions"
              type="Development"
              salary="$110k - $160k"
              remote
            />
            <JobCard
              title="Machine Learning Engineer"
              company="AI Labs"
              type="AI/ML"
              salary="$130k - $190k"
              remote={false}
            />
            <JobCard
              title="Frontend Developer"
              company="Web3 UI/UX"
              type="Web Development"
              salary="$100k - $140k"
              remote
            />
            <JobCard
              title="Backend Engineer"
              company="Scalable Systems"
              type="Software Engineering"
              salary="$115k - $170k"
              remote={false}
            />
            <JobCard
              title="Data Scientist"
              company="Big Data Analytics"
              type="Data Science"
              salary="$125k - $185k"
              remote
            />
            <JobCard
              title="DevOps Engineer"
              company="CloudOps"
              type="Infrastructure"
              salary="$110k - $150k"
              remote
            />
          </div>
        </div>
      </div>
    </div>
  );
}