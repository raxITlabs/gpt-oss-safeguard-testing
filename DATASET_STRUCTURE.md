# Dataset Structure Documentation

## Overview

All test datasets have been consolidated into a single `tests.csv` file per category for simplicity and better maintainability. Each test now includes metadata columns for categorization and filtering.

**Last Updated:** November 2, 2025

---

## File Structure

```
datasets/
├── spam/
│   └── tests.csv (70 tests: 40 baseline + 30 edge cases)
├── hate-speech/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
├── violence/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
├── sexual-content/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
├── self-harm/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
├── fraud/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
├── illegal-activity/
│   └── tests.csv (89 tests: 54 baseline + 35 edge cases)
└── unicode/
    └── tests.csv (75 tests: 55 baseline + 20 stress)
```

**Total: 659 tests across 8 categories**

---

## CSV Schema

### Column Definitions

```csv
test_id, test_name, test_content, gpt-oss-safeguard classification, test_type, tags
```

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| **test_id** | Integer | Unique test identifier | `1`, `42`, `135` |
| **test_name** | String | Descriptive test name | `SP3 - Coded Language 1` |
| **test_content** | String | The actual content to classify | `Fr33 m0n3y waiting for you!` |
| **gpt-oss-safeguard classification** | String | Expected classification | `SP0`, `HS3`, `INVALID` |
| **test_type** | String | Type/category of test | `baseline`, `edge_case`, `stress` |
| **tags** | String | Comma-separated tags | `obfuscation,leetspeak` |

### Test Types

| Type | Description | Use Case |
|------|-------------|----------|
| **baseline** | Original golden dataset tests | Straightforward, obvious examples |
| **edge_case** | Challenging/adversarial tests | Satire, coded language, boundary cases |
| **stress** | Extreme/advanced attack tests | Multi-layer encoding, homoglyphs, mutations |

### Common Tags

#### Obfuscation & Encoding
- `obfuscation` - Character substitution/encoding
- `leetspeak` - L33tsp34k patterns
- `emoji` - Emoji substitution
- `homoglyph` - Visually similar characters
- `unicode` - Unicode-specific attacks
- `zero-width` - Zero-width character abuse
- `tag-block` - Unicode tag block smuggling
- `bidirectional` - RTL/LTR override attacks
- `multi-layer` - Multiple encoding layers

#### Content Context
- `satire` - Satire or parody
- `news` - News reporting context
- `educational` - Educational/academic content
- `medical` - Medical/professional context
- `fictional` - Fictional/creative content

#### Test Characteristics
- `boundary` - Near policy boundaries
- `minimal-content` - Very short content
- `format-variation` - Unusual formatting
- `false-positive` - Known false positive risk
- `request-depiction` - Tests intent vs depiction

#### Attack Patterns
- `phishing` - Phishing attempts
- `credential-theft` - Credential harvesting
- `command-injection` - Command injection
- `data-exfiltration` - Data exfiltration attempts
- `malicious` - Clearly malicious intent

---

## Usage Examples

### Running All Tests (Default)

```bash
# Runs all tests in tests.csv (baseline + edge_case + stress)
uv run test_safeguard.py spam
uv run test_safeguard.py unicode
```

###

 Running Specific Dataset Files

```bash
# Use old golden dataset if needed
uv run test_safeguard.py spam --dataset-name golden_dataset.csv

# Use old edge cases if needed
uv run test_safeguard.py spam --dataset-name edge_cases.csv
```

### Debug Specific Tests

```bash
# Debug test #15 in spam category
uv run test_safeguard.py spam --debug --test-number 15

# Debug test #56 in unicode category (homoglyph attack)
uv run test_safeguard.py unicode --debug --test-number 56
```

---

## Migration Notes

### What Changed

**Before (old structure):**
```
datasets/spam/
├── golden_dataset.csv (40 tests)
└── edge_cases.csv (30 tests)
```

**After (new structure):**
```
datasets/spam/
└── tests.csv (70 tests with metadata)
```

### Benefits

1. **Single source of truth** - One file per category
2. **Better organization** - Metadata columns for categorization
3. **Easier testing** - Run all tests in one command
4. **Extensible** - Easy to add new test types (stress, mutation, etc.)
5. **Analytics-ready** - Can analyze pass rates by test_type and tags

### Backward Compatibility

Old files (`golden_dataset.csv`, `edge_cases.csv`) are preserved and can still be used:

```bash
uv run test_safeguard.py spam --dataset-name golden_dataset.csv
```

---

## Adding New Tests

### Adding to Existing Category

Edit `datasets/{category}/tests.csv` and add rows:

```csv
101,SP4 - New Stress Test,Extreme spam example,SP4,stress,"high-severity,automated"
```

### Adding Stress Tests

Stress tests should have `test_type: stress` and relevant tags:

```csv
test_id,test_name,test_content,gpt-oss-safeguard classification,test_type,tags
75,UC4 - Multi-Layer Attack,Normal text[HIDDEN],UC4,stress,"multi-layer,tag-block,destructive"
```

### Tagging Guidelines

1. **Be specific** - Use descriptive tags
2. **Comma-separated** - No spaces after commas
3. **Lowercase** - Use hyphens for multi-word tags
4. **Relevant** - Only add tags that add value for filtering/analysis

**Good tags:** `obfuscation,leetspeak,boundary`
**Bad tags:** `test, example, misc`

---

## Unicode Category (Special)

The Unicode category is unique because it tests **cross-cutting obfuscation techniques** that can apply to any policy category.

### Unicode Test Types

| Test Type | Count | Description |
|-----------|-------|-------------|
| **Baseline (UC0-UC4)** | 55 | Original Unicode smuggling tests |
| **Stress** | 20 | Advanced obfuscation attacks |
| **Total** | 75 | |

### Unicode Stress Tests Include

1. **Homoglyph attacks** (5 tests) - Visually similar characters
   - Cyrillic `а` instead of Latin `a`
   - Used in domain/brand spoofing

2. **Bidirectional text exploits** (2 tests) - RTL/LTR override
   - Makes `file.exe` appear as `file.txt`
   - Used in malware filename spoofing

3. **Zero-width character abuse** (2 tests) - Excessive invisible chars
   - Multiple zero-width spaces/joiners
   - Hidden instruction smuggling

4. **Multi-layer encoding** (2 tests) - Tag block + other techniques
   - Nested Unicode escapes
   - Layered obfuscation

5. **Normalization attacks** (2 tests) - NFC vs NFD inconsistencies
   - Combining character overflow
   - Filter bypass techniques

6. **Mixed attacks** (7 tests) - Complex combinations
   - URL spoofing, mixed scripts, command injection

### Running Unicode Tests

```bash
# Run all unicode tests (baseline + stress)
uv run test_safeguard.py unicode

# Run unicode tests against spam policy (cross-category testing)
uv run test_safeguard.py spam --dataset-name ../unicode/tests.csv
```

---

## Test Statistics

### By Category

| Category | Baseline | Edge Cases | Total |
|----------|----------|------------|-------|
| Spam | 40 | 30 | 70 |
| Hate Speech | 54 | 35 | 89 |
| Violence | 54 | 35 | 89 |
| Sexual Content | 54 | 35 | 89 |
| Self-Harm | 54 | 35 | 89 |
| Fraud | 54 | 35 | 89 |
| Illegal Activity | 54 | 35 | 89 |
| **Subtotal** | **364** | **240** | **604** |
| Unicode | 55 | 20 (stress) | 75 |
| **TOTAL** | **419** | **260** | **679** |

### By Test Type

- **Baseline:** 419 tests (62%)
- **Edge Case:** 240 tests (35%)
- **Stress:** 20 tests (3%)

---

## Future Enhancements

The new structure supports easy addition of:

1. **Mutation tests** - Variations of failed tests
2. **Boundary tests** - Systematic policy boundary exploration
3. **Adversarial tests** - AI-generated adversarial examples
4. **Multi-policy tests** - Tests spanning multiple categories
5. **Regression tests** - Tests for previously fixed bugs

All can be added to existing `tests.csv` files with appropriate `test_type` and `tags`.

---

## Schema Evolution

If you need to add more columns:

1. **Backward compatible** - Add optional columns to the right
2. **Document clearly** - Update this file
3. **Test compatibility** - Ensure test_safeguard.py still works
4. **Version control** - Note schema version in git commit

**Current Schema Version:** 1.0 (November 2, 2025)

---

## Questions?

- **How do I run only baseline tests?** Currently not supported, but can be added with `--test-type` filter
- **Can I add custom columns?** Yes, but test_safeguard.py will ignore them
- **Should I delete old files?** Keep them for now as backup, can delete later
- **How do I add request/depiction tests?** Distribute them to appropriate categories with `tags: request-depiction`

---

**Created:** November 2, 2025
**Purpose:** Document consolidated dataset structure
**Maintained by:** Testing team
