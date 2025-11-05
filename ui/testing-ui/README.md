# GPT-OSS-Safeguard Testing Dashboard

A modern, professional web dashboard for viewing and analyzing GPT-OSS-Safeguard test results.

## Features

- **Test Results Overview** - View summary metrics including accuracy, pass/fail rates, costs, and latency
- **Detailed Results Table** - Sortable and filterable table showing all test results
- **Test Details Modal** - Click any test to view full details including test content, model response, reasoning, and metrics
- **Log File Selection** - Browse and select from all historical test runs
- **Dynamic Data** - All data loaded from JSONL log files, no hardcoded values
- **Responsive Design** - Works on desktop and mobile devices
- **Dark Mode Support** - Built-in dark mode using Next.js themes

## Tech Stack

- Next.js 16, shadcn/ui (New York style), Tailwind CSS v4, TypeScript, Lucide Icons

## Getting Started

```bash
cd ui/testing-ui
pnpm install
pnpm dev
```

Open http://localhost:3000 in your browser.

## Project Structure

- `app/api/logs/` - API routes for fetching log data
- `components/` - Reusable UI components
- `lib/log-parser.ts` - JSONL parsing utilities
- `types/test-results.ts` - TypeScript definitions

## API Endpoints

- GET `/api/logs` - List all log files
- GET `/api/logs/latest` - Get latest test run
- GET `/api/logs/[filename]` - Get specific log data

## Dashboard created with shadcn/ui components
