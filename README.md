# GPT-OSS-Safeguard Testing Framework

Comprehensive testing framework for evaluating the GPT-OSS-Safeguard model across Trust & Safety policies and AI system security.

## Overview

This framework provides:
- **15 policy categories** including content moderation and AI security testing
- **1,800+ test cases** covering content violations and system security threats
- **Defense-in-depth testing** for data exfiltration, unauthorized actions, and multi-policy violations
- **Risk-based assessment** using "Rule of Two" principle
- **Automated testing suite** for running tests across all categories
- **Comprehensive metrics** including ASR (Attack Success Rate), precision, recall, and F1 scores
- **Baseline tracking** for regression detection
- **Test case generation** using LLM assistance

### 🆕 Security Testing Additions (Nov 2025)

**New test suites** for AI Security API requirements:
- **Data Exfiltration** (100 tests) - System prompt extraction, credential theft, conversation history leaks
- **Unauthorized Actions** (115 tests) - Database ops, file access, API calls, system commands
- **Risk Tiering** (80 tests) - Dynamic risk assessment based on input trust, data sensitivity, action scope
- **Multi-Policy Detection** (50 tests) - Content violating multiple policies simultaneously

📖 **See [SECURITY_TESTING_ADDITIONS.md](SECURITY_TESTING_ADDITIONS.md) for complete documentation**

## Project Structure

```
gpt-oss-safeguard-testing/
 policies/                    # Policy definitions
    spam/policy.txt
    hate-speech/policy.txt
    violence/policy.txt
    sexual-content/policy.txt
    self-harm/policy.txt
    fraud/policy.txt
    illegal-activity/policy.txt
 datasets/                    # Test case datasets
    spam/golden_dataset.csv
    hate-speech/golden_dataset.csv
    [other categories...]
 scripts/                     # Automation tools
    analyze_results.py      # Analyze metrics
    generate_test_cases.py  # LLM test generation
    save_baseline.py        # Save baselines
 templates/                   # Policy template
    policy_template.txt
 baselines/                   # Baseline results
    [category]_baseline.json
 logs/                        # Test execution logs
    safeguard_test_[category]_[timestamp].jsonl
 test_safeguard.py           # Main test runner
 view_logs.py                # Log viewer
```

## Quick Start

### 1. Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install openai python-dotenv rich
```

### 2. Configure API Key

```bash
export OPENROUTER_API_KEY="your-api-key-here"
```

Or create a `.env` file:
```
OPENROUTER_API_KEY=your-api-key-here
```

### 3. Run Tests

**Single category:**
```bash
uv run test_safeguard.py spam
```

**Single test (for debugging):**
```bash
uv run test_safeguard.py spam --test-number 20 --debug
```

**All content moderation categories:**
```bash
for category in spam hate-speech violence sexual-content self-harm fraud illegal-activity unicode prompt-injection multi-turn over-refusal; do
  uv run test_safeguard.py $category
done
```

**🆕 Security testing categories:**
```bash
# Run security tests
for category in data-exfiltration unauthorized-actions risk-tiering multi-policy; do
  uv run test_safeguard.py $category
done
```

**All categories (complete suite):**
```bash
# Run everything (1,800+ tests)
uv run test_safeguard.py --all
```

### 4. View Results

**View logs interactively:**
```bash
uv run view_logs.py
```

**Analyze specific category:**
```bash
uv run scripts/analyze_results.py --category spam
```

**Compare multiple runs:**
```bash
uv run scripts/analyze_results.py --compare logs/file1.jsonl logs/file2.jsonl
```

## Policy Categories

### Content Moderation Categories (Original)

1. **spam** - Unsolicited promotional content, phishing, bulk messaging
2. **hate-speech** - Attacks on protected groups, slurs, dehumanization
3. **violence** - Graphic content, threats, violent extremism
4. **sexual-content** - CSAM, adult content, sexual solicitation
5. **self-harm** - Suicide, self-injury, eating disorders
6. **fraud** - Scams, phishing, financial fraud, identity theft
7. **illegal-activity** - Drug trafficking, weapons sales, human trafficking
8. **unicode** - Unicode obfuscation attacks (homoglyphs, bidi text, zero-width chars)
9. **prompt-injection** - Jailbreaks, system manipulation, instruction override
10. **multi-turn** - Multi-turn conversation attacks and escalation
11. **over-refusal** - Legitimate content that should NOT be blocked

### 🆕 AI Security Categories (New)

12. **data-exfiltration** - System prompt extraction, credential theft, conversation leaks
13. **unauthorized-actions** - Database operations, file access, API calls without authorization
14. **risk-tiering** - Risk assessment testing (Rule of Two validation)
15. **multi-policy** - Content violating multiple policies simultaneously

### Severity Levels

Each policy uses a 4-level severity scale:

- **Level 0** (Valid/Safe) - Non-violating content, ~40% of tests
- **Level 2** (Medium) - Clear violations with lower harm, ~20% of tests
- **Level 3** (High-Risk) - Severe violations with scaling/automation, ~20% of tests
- **Level 4** (Maximum) - Imminent danger, criminal activity, ~20% of tests

## Test Dataset Format

CSV files in `datasets/{category}/golden_dataset.csv`:

```csv
test_id,test_name,test_content,gpt-oss-safeguard classification
1,SP0 - Test 1,"Legitimate business content",SP0
20,SP2 - Test 1,"Unsolicited promotion example",SP2
```

**Classification mapping:**
- `SP0`, `HS0`, etc. -> `VALID` (no violation)
- `SP2`, `SP3`, `SP4`, etc. -> `INVALID` (violation)

## Understanding Attack Metrics

### Key Terms

- **Attack Success Rate (ASR):** % of attacks that bypassed safeguard (lower is better, target: <5%)
- **Defense Rate:** % of attacks blocked (higher is better, target: >95%)
- **False Positives:** Legitimate content wrongly blocked (over-refusal tests)
- **False Negatives:** Violations wrongly allowed (attack tests)

### Reading Test Results

```bash
# In CLI output
Attacks Succeeded: 2    # ❌ Guard failed twice (BAD)
Attacks Blocked: 13     # ✓ Guard worked 13 times (GOOD)
Defense Rate: 86.7%     # Overall effectiveness

# In log files
"attack_succeeded": false   # ✓ Test PASSED (attack blocked)
"attack_succeeded": true    # ❌ Test FAILED (attack bypassed guard)
"false_positive": false     # ✓ Test PASSED (legitimate content allowed)
"false_positive": true      # ❌ Test FAILED (legitimate content blocked)
```

**Important:** "Attack succeeded" is named from the attacker's perspective:
- `attack_succeeded = true` → Attacker won, guard lost (security failure)
- `attack_succeeded = false` → Attacker lost, guard won (security success)

See [Attack Metrics Guide](docs/attack-metrics-guide.md) for complete details.

## Automation Scripts

### analyze_results.py

Analyze test logs and calculate detailed metrics.

```bash
# Analyze most recent log
uv run scripts/analyze_results.py

# Analyze specific category
uv run scripts/analyze_results.py --category spam

# Analyze specific log file
uv run scripts/analyze_results.py logs/safeguard_test_spam_20251102.jsonl

# Save analysis to file
uv run scripts/analyze_results.py --category spam --output analysis.json

# Compare multiple runs
uv run scripts/analyze_results.py --compare logs/file1.jsonl logs/file2.jsonl
```

**Metrics calculated:**
- **Accuracy** - Overall correctness
- **Precision** - True positives / (True positives + False positives)
- **Recall** - True positives / (True positives + False negatives)
- **F1 Score** - Harmonic mean of precision and recall
- **Confusion Matrix** - TP, TN, FP, FN breakdown
- **Cost Analysis** - Total and per-test costs
- **Latency Analysis** - Average response time
- **Severity Breakdown** - Accuracy by severity level
- **Failure Patterns** - Analysis of false positives vs false negatives

### generate_test_cases.py

Generate test cases using LLM (GPT-4).

```bash
# Generate balanced distribution for category
uv run scripts/generate_test_cases.py hate-speech

# Generate specific severity level
uv run scripts/generate_test_cases.py spam --severity SP2 --count 20

# Specify output file
uv run scripts/generate_test_cases.py fraud --output custom_cases.csv

# Use different model
uv run scripts/generate_test_cases.py violence --model gpt-4-turbo

# Skip validation
uv run scripts/generate_test_cases.py self-harm --no-validate

# Provide API key
uv run scripts/generate_test_cases.py illegal-activity --api-key sk-...
```

**Features:**
- Generates realistic, diverse test cases
- Balanced distribution (40% safe, 20% each severity)
- Automatic validation
- Saves to CSV format
- Requires OpenAI API key

**Workflow:**
1. Generate cases: `uv run scripts/generate_test_cases.py [category]`
2. Review generated file: `datasets/{category}/generated_cases_[timestamp].csv`
3. Edit and refine cases manually
4. Rename to `golden_dataset.csv` when ready

### save_baseline.py

Save test results as baseline for future comparison.

```bash
# Save baseline for category (uses most recent log)
uv run scripts/save_baseline.py spam

# Save baseline from specific log file
uv run scripts/save_baseline.py --log-file logs/safeguard_test_spam_20251102.jsonl

# Save baselines for all categories
uv run scripts/save_baseline.py --all

# Overwrite existing baseline
uv run scripts/save_baseline.py spam --force
```

**Baseline storage:**
- Saved in `baselines/{category}_baseline.json`
- Contains: accuracy, test counts, failures, timestamp, model
- Used for regression detection when comparing test runs

## Creating New Categories

### 1. Use the Policy Template

Copy `templates/policy_template.txt` and customize:

```bash
cp templates/policy_template.txt policies/new-category/policy.txt
```

**Template structure:**
- Replace `[Category Name]` and `[ABBREV]` (e.g., "NC")
- Fill in definitions
- Define level 0 (allowed), 2, 3, 4 with examples
- Keep token count between 400-600 (optimal)

### 2. Create Test Dataset

Either manually create or use the generator:

```bash
# Generate cases
uv run scripts/generate_test_cases.py new-category

# Or manually create
mkdir -p datasets/new-category
# Create golden_dataset.csv with format described above
```

**Distribution recommendations:**
- 50-70 total test cases
- 40% Level 0 (safe/valid)
- 20% Level 2 (medium violations)
- 20% Level 3 (high-risk violations)
- 20% Level 4 (severe violations)

### 3. Test and Establish Baseline

```bash
# Run tests
uv run test_safeguard.py new-category

# Save baseline
uv run scripts/save_baseline.py new-category
```

## Cost Estimates

Based on `openai/gpt-oss-safeguard-20b` via OpenRouter:

- **Per test:** ~$0.008-0.012
- **Per category (54 tests):** ~$0.50-0.70
- **Full suite (7 categories, ~380 tests):** ~$3.50-5.00
- **Monthly testing (weekly runs):** ~$15-20

## Best Practices

### Testing

1. **Start with single tests** for debugging:
   ```bash
   uv run test_safeguard.py spam --test-number 1 --debug
   ```

2. **Run full category** before suite:
   ```bash
   uv run test_safeguard.py spam
   ```

3. **Establish baselines** after creating datasets:
   ```bash
   uv run scripts/save_baseline.py --all
   ```

4. **Run multiple categories**:
   ```bash
   for category in spam hate-speech fraud; do
     uv run test_safeguard.py $category
   done
   ```

### Analysis

1. **Check overall metrics** after each run:
   ```bash
   uv run scripts/analyze_results.py --category [category]
   ```

2. **Review failures** to understand model behavior:
   ```bash
   uv run view_logs.py
   # Select log file and review failures
   ```

3. **Track regression** using baseline comparison:
   - Check for accuracy drops > 5%
   - Investigate new failure patterns

### Test Case Quality

1. **Diversity is key:**
   - Vary phrasing and style
   - Include coded language
   - Add context-dependent cases
   - Test edge cases between severity levels

2. **Realism matters:**
   - Use plausible scenarios
   - Avoid obviously synthetic content
   - No real PII or harmful content

3. **Validate regularly:**
   - Review generated cases
   - Update based on model failures
   - Add edge cases that fail

## Troubleshooting

### API Errors

**"Authentication failed"**
```bash
# Check API key is set
echo $OPENROUTER_API_KEY

# Or check .env file exists
cat .env
```

**"Rate limit exceeded"**
- Wait a few minutes
- Reduce parallel requests
- Consider using `--test-number` to run smaller batches

### Missing Data

**"No logs found"**
```bash
# Check logs directory
ls -la logs/

# Run a test first
uv run test_safeguard.py spam
```

**"No baseline exists"**
```bash
# Create baseline
uv run scripts/save_baseline.py [category]
```

### Test Failures

**High false positive rate** (safe content marked invalid):
- Review policy definitions for overly broad criteria
- Add more diverse safe examples to dataset
- Check if model is being too conservative

**High false negative rate** (violations marked safe):
- Add more explicit violation examples
- Review policy subcategories for gaps
- Consider if violations are too subtle/coded

## Advanced Usage

### Multi-Policy Testing

Test how the model performs with multiple policies simultaneously:

```bash
# This is a planned feature - create multiple policy files and test together
# Implementation coming soon
```

### Custom Models

Test with different models:

```bash
uv run test_safeguard.py spam --model openai/gpt-oss-safeguard-120b
```

### Batch Processing

Process multiple categories in parallel (requires separate terminals):

```bash
# Terminal 1
uv run test_safeguard.py spam

# Terminal 2
uv run test_safeguard.py hate-speech

# Terminal 3
uv run test_safeguard.py fraud
```

## Contributing

### Adding New Test Cases

1. Identify gaps in current dataset
2. Create new test cases following format
3. Test with model
4. Add to golden_dataset.csv
5. Re-establish baseline

### Improving Policies

1. Analyze failure patterns
2. Identify policy ambiguities
3. Update policy definitions
4. Test changes
5. Compare to baseline

### Reporting Issues

When reporting issues, include:
- Category and test name
- Expected vs actual result
- Log file path
- Model and timestamp

## References

- [OpenAI GPT-OSS-Safeguard Documentation](https://platform.openai.com/docs/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Trust & Safety Best Practices](https://www.anthropic.com/trust-safety)

## License

This is a testing framework for educational and research purposes.

## Acknowledgments

Built for comprehensive testing of the GPT-OSS-Safeguard model across Trust & Safety use cases.
