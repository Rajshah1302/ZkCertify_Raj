import { Suspense } from "react"
import RecruiterVerifyPageContent from "./RecruiterVerifyPageContent"

export default function RecruiterVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruiterVerifyPageContent />
    </Suspense>
  )
}
