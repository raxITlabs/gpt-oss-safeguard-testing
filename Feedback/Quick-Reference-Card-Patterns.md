# Quick Reference: Card Component Usage Patterns

**Last Updated:** 2025-11-15
**For:** GPT OSS Safeguard Testing UI

---

## 🎯 Golden Rules

### ❌ NEVER DO THIS:
```tsx
<Card className="p-4">  {/* Direct padding on Card */}
  <div>Content</div>
</Card>
```

### ✅ ALWAYS DO THIS:
```tsx
<Card>
  <CardContent>  {/* Padding on CardContent */}
    <div>Content</div>
  </CardContent>
</Card>
```

### ⭐ BEST PRACTICE (For Metrics):
```tsx
<MetricCard
  title="Pass Rate"
  value="95.0%"
  variant="success"
  icon={<CheckCircle2 />}
  footer={{ primary: "180 passed", secondary: "9 failed" }}
/>
```

---

## 📦 Component Structure

```tsx
<Card>                           // Container (border, shadow, bg-card)
                                 // Built-in: py-6, gap-6, rounded-xl

  <CardHeader>                   // Header area (px-6, gap-2)
    <CardDescription>           // Small text (text-sm, muted)
      Title Label
    </CardDescription>

    <CardTitle>                  // Main title (font-semibold)
      Main Title
    </CardTitle>

    <CardAction>                 // Action slot (top-right)
      <Badge>New</Badge>
    </CardAction>
  </CardHeader>

  <CardContent>                  // Content area (px-6)
    {/* Your content */}
  </CardContent>

  <CardFooter>                   // Footer area (px-6, flex)
    {/* Footer content */}
  </CardFooter>
</Card>
```

---

## 🎨 Common Patterns

### Pattern 1: Metric Card (Summary Stats)

**Use Case:** Pass rate, latency, cost, test count

```tsx
import { MetricCard } from "@/components/metric-card-enhanced"

<MetricCard
  title="Pass Rate"
  value="95.0%"
  variant="success"  // "default" | "success" | "warning" | "destructive"
  icon={<CheckCircle2 className="size-5" />}
  footer={{
    primary: "180 passed",
    secondary: "9 failed"
  }}
/>
```

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
  <MetricCard {...} />
</div>
```

---

### Pattern 2: Content Card with Tabs

**Use Case:** Multi-section content, tabbed interfaces

```tsx
<Card>
  <Tabs defaultValue="overview">
    <CardHeader className="pb-3">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
    </CardHeader>

    <CardContent>
      <TabsContent value="overview">
        {/* Overview content */}
      </TabsContent>
      <TabsContent value="details">
        {/* Details content */}
      </TabsContent>
    </CardContent>
  </Tabs>
</Card>
```

---

### Pattern 3: Simple Content Card

**Use Case:** Single section of content

```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>

  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

---

### Pattern 4: Card with Action Button

**Use Case:** Call-to-action cards

```tsx
<Card>
  <CardContent className="flex items-center justify-between">
    <div className="space-y-1">
      <CardTitle className="text-sm">View All Tests</CardTitle>
      <p className="text-sm text-muted-foreground">
        See detailed results in the test results table
      </p>
    </div>
    <Button asChild>
      <Link href="/results">View Results</Link>
    </Button>
  </CardContent>
</Card>
```

---

### Pattern 5: Nested Metric Cards

**Use Case:** Detailed metrics with multiple data points

```tsx
<Card className="border-2">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm flex items-center gap-2">
      <Clock className="size-4" />
      Latency
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">850ms</p>
    <p className="text-xs text-muted-foreground mt-1">Response time</p>
  </CardContent>
</Card>
```

---

### Pattern 6: Loading Skeleton

**Use Case:** Loading states

```tsx
<Card>
  <CardContent className="p-6">
    <Skeleton className="h-4 w-24 mb-2" />
    <Skeleton className="h-8 w-32" />
  </CardContent>
</Card>
```

**Note:** `p-6` override is acceptable for loading states to match loaded state

---

## 🎭 Spacing System

### Card Built-in Spacing:
- **Vertical padding:** `py-6` = 24px top/bottom
- **Vertical gaps:** `gap-6` = 24px between children
- **No horizontal padding** (handled by children)

### Child Components:
- **CardHeader:** `px-6` = 24px left/right
- **CardContent:** `px-6` = 24px left/right
- **CardFooter:** `px-6` = 24px left/right

### Total Spacing Example:
```
┌─────────────────────────────┐ ← Card border
│  py-6 (24px)                │ ← Card top padding
├─────────────────────────────┤
│ px-6  CardHeader       px-6 │ ← Horizontal padding
├─────────────────────────────┤
│  gap-6 (24px)               │ ← Gap between children
├─────────────────────────────┤
│ px-6  CardContent      px-6 │ ← Horizontal padding
├─────────────────────────────┤
│  py-6 (24px)                │ ← Card bottom padding
└─────────────────────────────┘
```

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Anti-Pattern 1: Direct Padding on Card
```tsx
// WRONG - Creates double padding
<Card className="p-4">
  <div>Content</div>
</Card>
```

**Problem:** Card already has `py-6` (24px) → Adding `p-4` (16px) = 40px total

**Fix:**
```tsx
// CORRECT
<Card>
  <CardContent>
    <div>Content</div>
  </CardContent>
</Card>
```

---

### ❌ Anti-Pattern 2: Manual Divs Instead of Semantic Components
```tsx
// WRONG - Non-semantic structure
<Card>
  <div className="px-6">
    <div className="text-sm text-muted-foreground">Title</div>
    <div className="text-2xl font-bold">Value</div>
  </div>
</Card>
```

**Problem:** Bypasses semantic structure, harder to maintain

**Fix:**
```tsx
// CORRECT
<Card>
  <CardHeader>
    <CardDescription>Title</CardDescription>
    <CardTitle>Value</CardTitle>
  </CardHeader>
</Card>
```

---

### ❌ Anti-Pattern 3: Repeating Metric Card Structure
```tsx
// WRONG - Repetitive code
<Card className="p-4">
  <div className="text-xs text-muted-foreground">Pass Rate</div>
  <div className="text-2xl font-bold">95.0%</div>
</Card>
<Card className="p-4">
  <div className="text-xs text-muted-foreground">Total Tests</div>
  <div className="text-2xl font-bold">189</div>
</Card>
// ... repeated 4+ times
```

**Problem:**
- Repetitive code (hard to maintain)
- Inconsistent with design system
- No variant support

**Fix:**
```tsx
// CORRECT - Use MetricCard
<MetricCard title="Pass Rate" value="95.0%" variant="success" />
<MetricCard title="Total Tests" value="189" variant="default" />
```

---

### ❌ Anti-Pattern 4: Bypassing CardContent for Content
```tsx
// WRONG
<Card>
  <div className="px-6">
    <p>Content</p>
  </div>
</Card>
```

**Problem:** Manual padding instead of semantic component

**Fix:**
```tsx
// CORRECT
<Card>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

---

## 📋 Import Cheatsheet

### Basic Card Usage:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### With Footer:
```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
```

### With Description:
```tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
```

### With MetricCard:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/metric-card-enhanced"
```

### Icons for MetricCard:
```tsx
import {
  CheckCircle2,  // Pass/success
  FileText,      // Documents/tests
  Clock,         // Time/latency
  DollarSign,    // Cost/money
  AlertCircle,   // Warnings/errors
  TrendingUp,    // Performance
  BarChart3      // Analytics
} from "lucide-react"
```

---

## 🎯 Decision Tree

```
Do you need to display a metric (number/percentage/currency)?
  YES → Use MetricCard
  NO  → Continue

Does the card have multiple sections (header, content, footer)?
  YES → Use Card + CardHeader + CardContent + CardFooter
  NO  → Continue

Does the card have just content?
  YES → Use Card + CardContent
  NO  → Continue

Is it tabbed content?
  YES → Use Card + Tabs + CardHeader (for TabsList) + CardContent (for TabsContent)
  NO  → Use Card + CardContent
```

---

## 🔍 Quick Audit Checklist

Use this to audit Card usage in your code:

- [ ] No `<Card className="p-*">` patterns (padding directly on Card)
- [ ] All content wrapped in `CardContent`, `CardHeader`, or `CardFooter`
- [ ] Metrics use `MetricCard` component instead of manual Cards
- [ ] Loading states use `<CardContent>` instead of `<div>`
- [ ] Semantic components (`CardTitle`, `CardDescription`) instead of manual divs
- [ ] Imports include all required Card subcomponents
- [ ] Grid layouts use responsive classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)

---

## 📊 Comparison Table

| Aspect | ❌ Incorrect | ✅ Correct |
|--------|-------------|-----------|
| **Padding** | `<Card className="p-4">` | `<Card><CardContent>` |
| **Metrics** | Manual divs | `<MetricCard />` |
| **Titles** | `<div className="font-bold">` | `<CardTitle>` |
| **Descriptions** | `<div className="text-muted">` | `<CardDescription>` |
| **Structure** | Flat divs | Semantic components |
| **Spacing** | Manual margins | Design system spacing |
| **Consistency** | Varies per page | Consistent across pages |

---

## 🎓 Reference Pages

**Gold Standard Examples:**
- `/app/(dashboard)/results/[testId]/page.tsx` - Lines 227-277 (MetricCard usage)
- `/app/(dashboard)/model/[modelName]/page.tsx` - Lines 176-220 (MetricCard usage)
- `/app/(dashboard)/results/[testId]/page.tsx` - Lines 280-603 (Card with Tabs)

**Component Source:**
- `/components/ui/card.tsx` - Card component definition
- `/components/metric-card-enhanced.tsx` - MetricCard component

---

## 💡 Pro Tips

1. **Always use MetricCard for metrics** - Don't reinvent the wheel
2. **Never apply padding to Card directly** - Use CardContent/CardHeader/CardFooter
3. **Use semantic components** - CardTitle, CardDescription, not generic divs
4. **Match existing patterns** - Look at results/[testId] and model/[modelName] pages
5. **Keep it simple** - If MetricCard fits, use it (don't over-engineer)

---

## 🔗 Related Documentation

- [Card Component API](/components/ui/card.tsx)
- [MetricCard Component API](/components/metric-card-enhanced.tsx)
- [Design System Spacing](/docs/design-system-spacing.md)
- [Component Composition Patterns](/docs/component-patterns.md)

---

## 📞 Need Help?

**Common Questions:**

**Q: Can I add custom padding to Card?**
A: No, use CardContent/CardHeader and apply padding there if needed

**Q: Should I use MetricCard or manual Card for metrics?**
A: Always use MetricCard for consistency

**Q: What if I need custom spacing?**
A: Apply it to CardContent/CardHeader, not Card itself

**Q: Can I nest Cards?**
A: Yes, but ensure parent Card structure is correct first

**Q: What about loading states?**
A: Use `<CardContent className="p-6">` for skeleton cards (acceptable override)

---

_This quick reference is based on the comprehensive Card Component Usage Analysis (2025-11-15)_
