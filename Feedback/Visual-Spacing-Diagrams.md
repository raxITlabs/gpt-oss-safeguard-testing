# Visual Spacing Diagrams: Card Component Architecture

**Purpose:** Visual reference for understanding Card component spacing and padding architecture

---

## 1. Card Component Anatomy

### Base Card Structure
```
┌─────────────────────────────────────────┐ ← Border (rounded-xl)
│                                         │
│           py-6 (24px)                   │ ← Vertical padding (top)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         Child Component           │  │
│  │         (CardHeader,              │  │
│  │          CardContent, or          │  │
│  │          CardFooter)              │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│           py-6 (24px)                   │ ← Vertical padding (bottom)
│                                         │
└─────────────────────────────────────────┘

Key Properties:
- py-6: 1.5rem / 24px vertical padding
- gap-6: 1.5rem / 24px gap between multiple children
- rounded-xl: 0.75rem / 12px border radius
- NO horizontal padding on Card itself
```

---

## 2. Complete Card with All Components

```
┌─────────────────────────────────────────┐ ← Card border
│                                         │
│         py-6 (24px top padding)         │ ← From Card
│                                         │
├─────────────────────────────────────────┤
│ px-6 │   CardHeader            │ px-6  │ ← Horizontal padding from CardHeader
│ (24) │                         │ (24)  │
│      │  CardDescription        │       │
│      │  CardTitle              │       │
│      │                         │       │
├─────────────────────────────────────────┤
│                                         │
│         gap-6 (24px)                    │ ← Gap between children
│                                         │
├─────────────────────────────────────────┤
│ px-6 │   CardContent           │ px-6  │ ← Horizontal padding from CardContent
│ (24) │                         │ (24)  │
│      │  Your content here      │       │
│      │                         │       │
├─────────────────────────────────────────┤
│                                         │
│         gap-6 (24px)                    │ ← Gap between children
│                                         │
├─────────────────────────────────────────┤
│ px-6 │   CardFooter            │ px-6  │ ← Horizontal padding from CardFooter
│ (24) │                         │ (24)  │
│      │  Footer content         │       │
│      │                         │       │
├─────────────────────────────────────────┤
│                                         │
│       py-6 (24px bottom padding)        │ ← From Card
│                                         │
└─────────────────────────────────────────┘

Total Height Breakdown:
- Top padding: 24px (from Card py-6)
- CardHeader: auto height + px-6 horizontal
- Gap: 24px (from Card gap-6)
- CardContent: auto height + px-6 horizontal
- Gap: 24px (from Card gap-6)
- CardFooter: auto height + px-6 horizontal
- Bottom padding: 24px (from Card py-6)
```

---

## 3. Incorrect Pattern (Double Padding)

### ❌ WRONG: Direct padding on Card
```tsx
<Card className="p-4">
  <div>Content</div>
</Card>
```

```
┌─────────────────────────────────────────┐ ← Card border
│ py-6 (24px) ← BUILT-IN Card padding    │
│  ┌───────────────────────────────────┐  │
│  │ p-4 (16px all sides) ← ADDED      │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │                             │  │  │
│  │  │  Content                    │  │  │
│  │  │                             │  │  │
│  │  └─────────────────────────────┘  │  │
│  │           p-4 (16px)              │  │
│  └───────────────────────────────────┘  │
│ py-6 (24px)                             │
└─────────────────────────────────────────┘

PROBLEM: Double vertical padding
- Card's py-6: 24px top + 24px bottom = 48px
- Manual p-4: 16px top + 16px bottom = 32px
- TOTAL: 40px top + 40px bottom = 80px vertical padding
  (16px from p-4 + 24px from py-6 on each side)

Horizontal also doubled:
- Card width is full
- p-4 adds 16px left + 16px right
- TOTAL: 32px horizontal padding (inconsistent)
```

---

## 4. Correct Pattern (Proper Composition)

### ✅ CORRECT: Using CardContent
```tsx
<Card>
  <CardContent>
    <div>Content</div>
  </CardContent>
</Card>
```

```
┌─────────────────────────────────────────┐ ← Card border
│                                         │
│       py-6 (24px) ← Card padding        │
│                                         │
├─────────────────────────────────────────┤
│ px-6 │  CardContent           │ px-6   │ ← ONLY horizontal padding
│ (24) │                        │ (24)   │
│      │  ┌──────────────────┐  │        │
│      │  │                  │  │        │
│      │  │  Content         │  │        │
│      │  │                  │  │        │
│      │  └──────────────────┘  │        │
│      │                        │        │
├─────────────────────────────────────────┤
│                                         │
│       py-6 (24px) ← Card padding        │
│                                         │
└─────────────────────────────────────────┘

CORRECT: Single layer of padding
- Vertical: 24px top + 24px bottom (from Card py-6)
- Horizontal: 24px left + 24px right (from CardContent px-6)
- TOTAL: Consistent 24px padding on all sides ✅
```

---

## 5. MetricCard Internal Structure

### MetricCard Component (Simplified)
```tsx
<Card>
  <CardHeader>
    <CardDescription>Title</CardDescription>
    <CardTitle>Value</CardTitle>
  </CardHeader>
  <CardFooter>
    <div>Footer</div>
  </CardFooter>
</Card>
```

```
┌─────────────────────────────────────────┐ ← Card border
│                                         │
│       py-6 (24px)                       │ ← Card top padding
│                                         │
├─────────────────────────────────────────┤
│ px-6 │  CardHeader            │ px-6   │ ← Header with horizontal padding
│ (24) │                        │ (24)   │
│      │  ┌──────────────────┐  │        │
│      │  │ CardDescription  │  │        │
│      │  │ "Pass Rate"      │  │        │ ← Title (text-sm, muted)
│      │  └──────────────────┘  │        │
│      │                        │        │
│      │  ┌──────────────────┐  │        │
│      │  │ CardTitle        │  │        │
│      │  │ "95.0%"          │  │        │ ← Value (text-2xl, bold)
│      │  └──────────────────┘  │        │
│      │                        │        │
├─────────────────────────────────────────┤
│                                         │
│       gap-6 (24px)                      │ ← Gap between Header & Footer
│                                         │
├─────────────────────────────────────────┤
│ px-6 │  CardFooter            │ px-6   │ ← Footer with horizontal padding
│ (24) │                        │ (24)   │
│      │  "180 passed"          │        │ ← Primary text
│      │  "9 failed"            │        │ ← Secondary text
│      │                        │        │
├─────────────────────────────────────────┤
│                                         │
│       py-6 (24px)                       │ ← Card bottom padding
│                                         │
└─────────────────────────────────────────┘

Why This Works:
✅ No custom padding needed
✅ Design system handles all spacing
✅ Consistent across all metric cards
✅ Semantic structure (CardHeader, CardFooter)
```

---

## 6. Side-by-Side: Wrong vs Right

### Current Implementation (method/[testType]/page.tsx)

#### ❌ WRONG:
```tsx
<Card className="p-4">
  <div className="flex items-center gap-2 mb-1">
    <div className="text-xs font-medium text-muted-foreground">Pass Rate</div>
  </div>
  <div className="text-2xl font-bold">{passRate}%</div>
</Card>
```

```
┌─────────────────────────────┐
│ 24px (py-6 from Card)       │ ← Built-in
│  ┌───────────────────────┐  │
│  │ 16px (p-4 added)      │  │ ← Manual addition
│  │  ┌─────────────────┐  │  │
│  │  │ Pass Rate       │  │  │ ← Non-semantic div
│  │  │ 95.0%           │  │  │ ← Non-semantic div
│  │  └─────────────────┘  │  │
│  │ 16px               │  │
│  └───────────────────────┘  │
│ 24px                        │
└─────────────────────────────┘
TOTAL: 40px top + 40px bottom
```

#### ✅ CORRECT (Option 1 - MetricCard):
```tsx
<MetricCard
  title="Pass Rate"
  value={`${passRate}%`}
  variant="success"
  footer={{ primary: "180 passed", secondary: "9 failed" }}
/>
```

```
┌─────────────────────────────┐
│ 24px (py-6 from Card)       │
│  ┌───────────────────────┐  │
│  │ CardHeader (px-6)     │  │ ← Semantic component
│  │  Pass Rate            │  │ ← CardDescription
│  │  95.0%                │  │ ← CardTitle
│  └───────────────────────┘  │
│ 24px (gap-6)                │
│  ┌───────────────────────┐  │
│  │ CardFooter (px-6)     │  │ ← Semantic component
│  │  180 passed           │  │ ← Footer primary
│  │  9 failed             │  │ ← Footer secondary
│  └───────────────────────┘  │
│ 24px (py-6 from Card)       │
└─────────────────────────────┘
TOTAL: 24px top + 24px bottom ✅
```

#### ✅ CORRECT (Option 2 - Manual but proper):
```tsx
<Card>
  <CardContent>
    <div className="flex items-center gap-2 mb-1">
      <div className="text-xs font-medium text-muted-foreground">Pass Rate</div>
    </div>
    <div className="text-2xl font-bold">{passRate}%</div>
  </CardContent>
</Card>
```

```
┌─────────────────────────────┐
│ 24px (py-6 from Card)       │
│  ┌───────────────────────┐  │
│  │ CardContent (px-6)    │  │ ← Semantic component
│  │  Pass Rate            │  │
│  │  95.0%                │  │
│  └───────────────────────┘  │
│ 24px (py-6 from Card)       │
└─────────────────────────────┘
TOTAL: 24px top + 24px bottom ✅
```

---

## 7. Grid Layout Spacing

### Metrics Grid (4 columns)
```
┌────────────┬────────────┬────────────┬────────────┐
│ Pass Rate  │ Total Tests│ Avg Latency│ Total Cost │ ← Grid with gap-4 (16px)
├────────────┼────────────┼────────────┼────────────┤
│ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │ ┌────────┐ │
│ │Header  │ │ │Header  │ │ │Header  │ │ │Header  │ │ ← Each card has py-6
│ │        │ │ │        │ │ │        │ │ │        │ │
│ │Footer  │ │ │Footer  │ │ │Footer  │ │ │Footer  │ │
│ └────────┘ │ └────────┘ │ └────────┘ │ └────────┘ │
└────────────┴────────────┴────────────┴────────────┘
     ↑ 16px gap between cards (from gap-4)

Spacing Breakdown:
- Outer div: grid grid-cols-4 gap-4
- Gap between cards: 16px (gap-4)
- Each card internal: 24px padding (py-6)
- Card children: 24px horizontal padding (px-6)
```

### Responsive Grid Behavior
```
Desktop (lg): 4 columns
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │
└────┴────┴────┴────┘

Tablet (md): 2 columns
┌────┬────┐
│ 1  │ 2  │
├────┼────┤
│ 3  │ 4  │
└────┴────┘

Mobile: 1 column
┌────┐
│ 1  │
├────┤
│ 2  │
├────┤
│ 3  │
├────┤
│ 4  │
└────┘

Grid classes: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
```

---

## 8. Loading State Spacing

### ❌ WRONG:
```tsx
<Card>
  <div className="p-6">
    <Skeleton />
  </div>
</Card>
```

```
┌─────────────────────────────┐
│ 24px (py-6 from Card)       │
│  ┌───────────────────────┐  │
│  │ 24px (p-6 manual)     │  │ ← Generic div (non-semantic)
│  │  ┌─────────────────┐  │  │
│  │  │ Skeleton        │  │  │
│  │  └─────────────────┘  │  │
│  │ 24px                  │  │
│  └───────────────────────┘  │
│ 24px                        │
└─────────────────────────────┘
```

### ✅ CORRECT:
```tsx
<Card>
  <CardContent className="p-6">
    <Skeleton />
  </CardContent>
</Card>
```

```
┌─────────────────────────────┐
│ 24px (py-6 from Card)       │
│  ┌───────────────────────┐  │
│  │ CardContent           │  │ ← Semantic component
│  │ 24px (p-6 override)   │  │
│  │  ┌─────────────────┐  │  │
│  │  │ Skeleton        │  │  │
│  │  └─────────────────┘  │  │
│  │ 24px                  │  │
│  └───────────────────────┘  │
│ 24px                        │
└─────────────────────────────┘

Note: p-6 override acceptable for loading state
to match the loaded state spacing
```

---

## 9. Nested Cards Example

### Parent Card with Child Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Metrics Overview</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Latency</CardTitle>
        </CardHeader>
        <CardContent>
          <p>850ms</p>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <p>$0.0002</p>
        </CardContent>
      </Card>
    </div>
  </CardContent>
</Card>
```

```
┌─────────────────────────────────────────────────┐ ← Parent Card
│ 24px (py-6)                                     │
│  ┌───────────────────────────────────────────┐  │
│  │ CardHeader (px-6)                         │  │
│  │ "Metrics Overview"                        │  │
│  └───────────────────────────────────────────┘  │
│ 24px (gap-6)                                    │
│  ┌───────────────────────────────────────────┐  │
│  │ CardContent (px-6)                        │  │
│  │  ┌───────────────┬───────────────┐        │  │
│  │  │ Child Card 1  │ Child Card 2  │ ← gap-4│  │
│  │  │ ┌───────────┐ │ ┌───────────┐ │        │  │
│  │  │ │ Header    │ │ │ Header    │ │        │  │
│  │  │ │ Content   │ │ │ Content   │ │        │  │
│  │  │ └───────────┘ │ └───────────┘ │        │  │
│  │  └───────────────┴───────────────┘        │  │
│  └───────────────────────────────────────────┘  │
│ 24px (py-6)                                     │
└─────────────────────────────────────────────────┘

Key Points:
- Parent Card: py-6 vertical padding
- Parent CardContent: px-6 horizontal padding
- Child Cards: each has own py-6 and child px-6
- Grid gap: gap-4 (16px) between child cards
```

---

## 10. Real-World Example Comparison

### method/[testType]/page.tsx - Current State

```tsx
// Lines 203-239 (Current - WRONG)
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <Card className={getStatusColor() + " p-4 border-2"}>
    <div className="flex items-center gap-2 mb-1">
      <div className="text-xs font-medium text-muted-foreground">Pass Rate</div>
      <InfoTooltip content="Percentage of tests that passed" />
    </div>
    <div className="text-2xl font-bold text-foreground">{passRate.toFixed(1)}%</div>
  </Card>
  {/* ... 3 more similar cards */}
</div>
```

**Spacing Issues:**
```
Each Card:
┌─────────────────────────┐
│ py-6 (24px) ← Built-in  │
│  ┌───────────────────┐  │
│  │ p-4 (16px) ← Added│  │  ⚠️ DOUBLE PADDING
│  │  Content          │  │
│  │ p-4 (16px)        │  │
│  └───────────────────┘  │
│ py-6 (24px)             │
└─────────────────────────┘

Total vertical: 40px each side
Total horizontal: 16px each side
❌ Inconsistent with design system
```

### results/[testId]/page.tsx & model/[modelName]/page.tsx - Correct Pattern

```tsx
// Lines 227-277 (Correct - REFERENCE)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard
    title="Test Status"
    value={isPassed ? "Passed" : "Failed"}
    icon={<CheckCircle2 className="size-5" />}
    variant={isPassed ? "success" : "destructive"}
    footer={{
      primary: test.category || "N/A",
      secondary: test.test_type || "baseline"
    }}
  />
  {/* ... 3 more MetricCards */}
</div>
```

**Proper Spacing:**
```
Each MetricCard (internally):
┌─────────────────────────┐
│ py-6 (24px) ← Card      │
│  ┌───────────────────┐  │
│  │ CardHeader (px-6) │  │  ✅ PROPER STRUCTURE
│  │  Title            │  │
│  │  Value            │  │
│  └───────────────────┘  │
│ gap-6 (24px)            │
│  ┌───────────────────┐  │
│  │ CardFooter (px-6) │  │
│  │  Footer           │  │
│  └───────────────────┘  │
│ py-6 (24px)             │
└─────────────────────────┘

Total vertical: 24px each side
Total horizontal: 24px each side
✅ Consistent with design system
```

---

## 11. Padding Override Scenarios

### When is manual padding acceptable?

#### ✅ ACCEPTABLE: Loading states
```tsx
<Card>
  <CardContent className="p-6">  {/* Override to match loaded state */}
    <Skeleton />
  </CardContent>
</Card>
```

**Reason:** Ensures loading skeleton matches loaded content spacing

#### ✅ ACCEPTABLE: Custom CardHeader padding
```tsx
<Card>
  <CardHeader className="pb-3">  {/* Reduce bottom padding for TabsList */}
    <TabsList>...</TabsList>
  </CardHeader>
</Card>
```

**Reason:** Design requires tighter spacing for tabs

#### ❌ NOT ACCEPTABLE: Direct Card padding
```tsx
<Card className="p-4">  {/* NEVER do this */}
  <div>Content</div>
</Card>
```

**Reason:** Bypasses design system, creates double padding

---

## 12. Summary Checklist

### Visual Spacing Audit:

- [ ] **No direct padding on Card** (`<Card className="p-*">`)
  - Card should only have `py-6` (built-in)

- [ ] **CardContent/CardHeader/CardFooter provide horizontal padding**
  - Each has `px-6` (built-in)

- [ ] **Consistent vertical spacing**
  - 24px (py-6) from Card
  - 24px (gap-6) between children

- [ ] **Grid layouts use proper gaps**
  - `gap-4` (16px) between cards in grids

- [ ] **MetricCard for all metrics**
  - No manual card structure for metrics

- [ ] **Semantic components used**
  - CardTitle, CardDescription, not generic divs

- [ ] **Loading states match loaded states**
  - Same spacing in skeleton and real content

---

## 13. Quick Reference Table

| Element | Vertical Padding | Horizontal Padding | Gap |
|---------|------------------|-------------------|-----|
| **Card** | `py-6` (24px) | None | `gap-6` (24px) |
| **CardHeader** | None | `px-6` (24px) | `gap-2` (8px internal) |
| **CardContent** | None | `px-6` (24px) | None |
| **CardFooter** | None | `px-6` (24px) | None |
| **Grid** | None | None | `gap-4` (16px) |

### Total Spacing for Simple Card:
- **Top:** 24px (from Card py-6)
- **Right:** 24px (from CardContent px-6)
- **Bottom:** 24px (from Card py-6)
- **Left:** 24px (from CardContent px-6)
- **Total:** 24px uniform padding ✅

### Total Spacing with Wrong Pattern:
- **Top:** 40px (24px Card + 16px p-4)
- **Right:** 16px (from p-4)
- **Bottom:** 40px (24px Card + 16px p-4)
- **Left:** 16px (from p-4)
- **Total:** Inconsistent and wrong ❌

---

_These diagrams illustrate the proper Card component spacing architecture. Always follow the design system's built-in spacing instead of applying manual padding to Card elements._
