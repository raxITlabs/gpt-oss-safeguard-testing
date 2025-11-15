"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getTestData } from "@/actions/get-test-data"
import { InferenceEvent, TestCategory, TEST_CATEGORIES } from "@/types/test-results"
import { ALL_TEST_TYPES } from "@/lib/constants"
import { useBreadcrumbs } from "@/contexts/breadcrumb-context"
import { useSettings } from "@/contexts/settings-context"
import { PageHeader } from "@/components/ui/page-header"
import { PolicyDetailCard } from "@/components/policy-detail-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

interface PolicyCategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default function PolicyCategoryPage({ params }: PolicyCategoryPageProps) {
  const router = useRouter()
  const { setBreadcrumbs } = useBreadcrumbs()
  const { strictPolicyValidation } = useSettings()
  const [category, setCategory] = useState<string>("")
  const [tests, setTests] = useState<InferenceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setCategory(p.category))
  }, [params])

  const formatCategory = (cat: string) => {
    return cat
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Set breadcrumbs when category is available
  useEffect(() => {
    if (category) {
      setBreadcrumbs([
        { label: "Dashboard", href: "/" },
        { label: "Policies", href: "/#attack-scenarios" },
        { label: formatCategory(category) },
      ])
    }
  }, [category, setBreadcrumbs])

  useEffect(() => {
    if (!category) return

    async function fetchTests() {
      try {
        setLoading(true)
        setError(null)

        // Validate category
        if (!TEST_CATEGORIES.includes(category as TestCategory)) {
          // Check if user tried to use a test type instead of a category
          const normalizedParam = category.replace(/_/g, '-')
          const isTestType = ALL_TEST_TYPES.some(testType =>
            testType.replace(/_/g, '-') === normalizedParam
          )

          if (isTestType) {
            setError(`test-type-redirect:${normalizedParam}`)
          } else {
            setError(`invalid-category:${category}`)
          }
          return
        }

        const data = await getTestData()

        // Filter tests by category
        const categoryTests = data.inferences.filter(
          t => t.category === category
        )

        if (categoryTests.length === 0) {
          setError(`No tests found for category "${category}"`)
          return
        }

        setTests(categoryTests)
      } catch (err) {
        console.error("Error fetching tests:", err)
        setError("Failed to load policy category data")
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [category])

  if (loading) {
    return (
      <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (error || tests.length === 0) {
    // Parse error message to determine error type
    let errorTitle = "Error"
    let errorMessage = error || "No tests found for this policy category."
    let suggestedLink: { href: string; label: string } | null = null

    if (error?.startsWith("test-type-redirect:")) {
      const testType = error.split(":")[1]
      errorTitle = "Wrong Route"
      errorMessage = `"${testType}" is a test methodology, not a policy category.`
      suggestedLink = {
        href: `/method/${testType}`,
        label: `View ${testType} tests`
      }
    } else if (error?.startsWith("invalid-category:")) {
      const invalidCat = error.split(":")[1]
      errorTitle = "Invalid Category"
      errorMessage = `"${invalidCat}" is not a valid policy category.`
    }

    return (
      <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
        <PageHeader
          title="Policy Category"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorTitle}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{errorMessage}</p>
            {error?.startsWith("invalid-category:") && (
              <div>
                <p className="font-medium mt-2 mb-1">Valid policy categories:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {TEST_CATEGORIES.map(cat => (
                    <li key={cat}>
                      <Link href={`/policy/${cat}`} className="hover:underline text-blue-600 dark:text-blue-400">
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          {suggestedLink && (
            <Button asChild>
              <Link href={suggestedLink.href}>
                {suggestedLink.label}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
      <PageHeader
        title={`Policy: ${formatCategory(category)}`}
        description="Detailed analysis and test results for this policy category"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      <PolicyDetailCard category={category as TestCategory} tests={tests} strictPolicyValidation={strictPolicyValidation} />
    </main>
  )
}
