# Log Query Reference

Quick reference for querying and visualizing gpt-oss-safeguard test logs.

## Using the Python Log Viewer (Recommended)

### Basic Usage

```bash
# View latest log with summary and results table
uv run view_logs.py

# View specific log file
uv run view_logs.py logs/safeguard_test_20251101_230833.jsonl

# View only summary
uv run view_logs.py --summary-only

# View detailed information for each test
uv run view_logs.py --detailed

# Show full test names (no truncation)
uv run view_logs.py --full-names
```

### Filtering

```bash
# Filter by event type
uv run view_logs.py --filter session_summary
uv run view_logs.py --filter inference
uv run view_logs.py --filter error
```

---

## Using jq (Command Line JSON Processor)

Install jq if needed:
```bash
brew install jq  # macOS
```

### Basic Queries

```bash
# Pretty-print all logs
cat logs/*.jsonl | jq

# View only inference events
cat logs/*.jsonl | jq 'select(.event_type == "inference")'

# View only session summary
cat logs/*.jsonl | jq 'select(.event_type == "session_summary")'
```

### Extract Specific Fields

```bash
# Get all test results
cat logs/*.jsonl | jq 'select(.event_type == "inference") |
  {test: .test_name, expected: .test_result.expected,
   actual: .test_result.actual, passed: .test_result.passed}'

# Get token usage for each test
cat logs/*.jsonl | jq 'select(.event_type == "inference") |
  {test: .test_name, tokens: .usage.total_tokens}'

# Get costs for each test
cat logs/*.jsonl | jq 'select(.event_type == "inference") |
  {test: .test_name, cost: .metrics.cost_usd}'
```

### Aggregate Calculations

```bash
# Total cost across all logs
cat logs/*.jsonl | jq -s 'map(select(.event_type == "session_summary")) |
  map(.metrics.total_cost_usd) | add'

# Average latency across all tests
cat logs/*.jsonl | jq -s 'map(select(.event_type == "inference")) |
  map(.metrics.latency_ms) | add/length'

# Total tokens used
cat logs/*.jsonl | jq -s 'map(select(.event_type == "session_summary")) |
  map(.usage.total_tokens) | add'

# Count of failed tests
cat logs/*.jsonl | jq -s 'map(select(.event_type == "inference")) |
  map(select(.test_result.passed == false)) | length'
```

### Create Simple Tables with jq + column

```bash
# Test results as TSV table
cat logs/*.jsonl | jq -r 'select(.event_type == "inference") |
  [.test_number, .test_name, .test_result.expected, .test_result.actual,
   .usage.total_tokens, .metrics.cost_usd, .metrics.latency_ms] | @tsv' |
  column -t -s $'\t'

# With headers
echo -e "#\tTest Name\tExpected\tActual\tTokens\tCost\tLatency" && \
cat logs/*.jsonl | jq -r 'select(.event_type == "inference") |
  [.test_number, .test_name, .test_result.expected, .test_result.actual,
   .usage.total_tokens, .metrics.cost_usd, .metrics.latency_ms] | @tsv' |
  column -t -s $'\t'
```

### Filter by Test Result

```bash
# Show only failed tests
cat logs/*.jsonl | jq 'select(.event_type == "inference") |
  select(.test_result.passed == false)'

# Show only passed tests
cat logs/*.jsonl | jq 'select(.event_type == "inference") |
  select(.test_result.passed == true)'
```

---

## Using jtbl (Optional - JSON to Table)

Install jtbl:
```bash
uv add jtbl
# or
pip install jtbl
```

### Basic Usage

```bash
# View all inference events as table
cat logs/*.jsonl | grep '"event_type": "inference"' | jtbl

# View with specific fields
cat logs/*.jsonl | jq -c 'select(.event_type == "inference") |
  {test: .test_name, expected: .test_result.expected,
   actual: .test_result.actual, tokens: .usage.total_tokens}' | jtbl
```

---

## Common Use Cases

### Find Most Expensive Tests

```bash
cat logs/*.jsonl | jq 'select(.event_type == "inference")' |
  jq -s 'sort_by(.metrics.cost_usd) | reverse | .[0:3]'
```

### Find Slowest Tests

```bash
cat logs/*.jsonl | jq 'select(.event_type == "inference")' |
  jq -s 'sort_by(.metrics.latency_ms) | reverse | .[0:3]'
```

### Compare Multiple Test Runs

```bash
# Get summary from all log files
for file in logs/*.jsonl; do
  echo "File: $file"
  cat "$file" | jq 'select(.event_type == "session_summary") |
    {accuracy: .results.accuracy_percent,
     total_cost: .metrics.total_cost_usd,
     avg_latency: .metrics.average_latency_ms}'
  echo
done
```

### Export to CSV

```bash
# Export test results to CSV
echo "test_number,test_name,expected,actual,passed,tokens,cost,latency" > results.csv
cat logs/*.jsonl | jq -r 'select(.event_type == "inference") |
  [.test_number, .test_name, .test_result.expected, .test_result.actual,
   .test_result.passed, .usage.total_tokens, .metrics.cost_usd, .metrics.latency_ms] |
  @csv' >> results.csv
```

---

## Analysis with Python

For more complex analysis, load logs in Python:

```python
import json
from pathlib import Path

# Load all logs
logs = []
for log_file in Path("logs").glob("*.jsonl"):
    with open(log_file) as f:
        logs.extend([json.loads(line) for line in f])

# Filter inference events
inferences = [log for log in logs if log["event_type"] == "inference"]

# Analyze
import pandas as pd
df = pd.DataFrame([
    {
        "test": i["test_name"],
        "tokens": i["usage"]["total_tokens"],
        "cost": i["metrics"]["cost_usd"],
        "latency": i["metrics"]["latency_ms"],
        "passed": i["test_result"]["passed"]
    }
    for i in inferences
])

print(df.describe())
print(f"\nTotal cost: ${df['cost'].sum():.6f}")
print(f"Success rate: {df['passed'].mean() * 100:.1f}%")
```

---

## Quick Tips

- **Latest log**: `uv run view_logs.py` (no arguments)
- **Pretty JSON**: `cat logs/*.jsonl | jq`
- **Specific test**: `cat logs/*.jsonl | jq 'select(.test_name == "Valid - Help Request")'`
- **Error logs**: `cat logs/*.jsonl | jq 'select(.event_type == "error")'`
- **Session info**: `cat logs/*.jsonl | jq 'select(.event_type == "session_start")'`
