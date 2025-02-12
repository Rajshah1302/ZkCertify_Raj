"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Question {
  question: string
  options: string[]
  correct_answer: string
}

interface Test {
  technology: string
  questions: Question[]
}

export default function TestPage() {
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const technology = params.technology as string

  useEffect(() => {
    fetchTest()
  }, []) // Removed unnecessary dependency

  const fetchTest = async () => {
    try {
      setLoading(true)
      const response = await axios.post("http://localhost:4000/test/generate", { technology })
      if (response.data.success) {
        setTest(response.data.test)
        setAnswers(new Array(response.data.test.questions.length).fill(""))
      } else {
        setError("Failed to fetch test questions")
      }
    } catch (err) {
      setError("An error occurred while fetching the test")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev]
      newAnswers[questionIndex] = answer
      return newAnswers
    })
  }

  const handleSubmit = () => {
    if (!test) return

    const correctAnswers = test.questions.filter((q, index) => q.correct_answer === answers[index])
    const calculatedScore = (correctAnswers.length / test.questions.length) * 100
    setScore(calculatedScore)
  }

  const handleRetry = () => {
    setScore(null)
    setAnswers(new Array(test?.questions.length || 0).fill(""))
    fetchTest()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!test) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No test data available</AlertDescription>
      </Alert>
    )
  }

  if (score !== null) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Test Result</CardTitle>
        </CardHeader>
        <CardContent>
          {score > 50 ? (
            <Alert>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Congratulations! You scored {score.toFixed(2)}%. The {technology} skill has been added to your profile.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Test Failed</AlertTitle>
              <AlertDescription>
                You scored {score.toFixed(2)}%. You need to score more than 50% to add this skill to your profile.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={() => router.push("/student")}>Back to Home</Button>
          {score <= 50 && <Button onClick={handleRetry}>Retry Test</Button>}
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{technology} Skill Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {test.questions.map((question, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {index + 1}. {question.question}
            </h3>
            <RadioGroup value={answers[index]} onValueChange={(value) => handleAnswerChange(index, value)}>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`q${index}-option${optionIndex}`} />
                  <Label htmlFor={`q${index}-option${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={answers.some((answer) => answer === "")}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

