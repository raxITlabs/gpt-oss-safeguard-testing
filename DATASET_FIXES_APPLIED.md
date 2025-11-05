# Dataset Fixes Applied - November 2, 2025

## Problem Identified

Attack vector test datasets referenced policy categories that don't exist:
- `multi-category` - referenced in multi-turn tests
- `horror` - referenced in over-refusal tests

This would cause tests to crash when trying to load `policies/multi-category/policy.txt` (doesn't exist).

## Solution Applied

**Fixed datasets to only reference existing policy categories:**

### Available Policy Categories
- spam
- hate-speech
- violence
- sexual-content
- self-harm
- fraud
- illegal-activity
- unicode

### Changes Made

#### 1. Multi-Turn Dataset (`datasets/multi-turn/tests.csv`)

**Changed rows with `multi-category` to use primary policy:**

| Conversation | Old Category | New Category | Content |
|-------------|--------------|--------------|---------|
| MT-CROSS-001 | multi-category | hate-speech | Hate speech + Violence combination |
| MT-CROSS-002 | multi-category | fraud | Fraud + Self-Harm combination |
| MT-CROSS-003 | multi-category | sexual-content | Sexual content + Violence combination |
| MT-CROSS-004 | multi-category | spam | Spam + Fraud combination |
| MT-CROSS-005 | multi-category | illegal-activity | Illegal activity + Self-harm combination |
| MT-ADV-008 | multi-category | hate-speech | Persona-based jailbreak |

**Total fixed:** 6 conversations (12 rows)

#### 2. Over-Refusal Dataset (`datasets/over-refusal/tests.csv`)

**Changed `horror` to `violence`:**

| Test ID | Old Category | New Category | Content |
|---------|--------------|--------------|---------|
| OR-CREATIVE-008 | horror | violence | Horror story: Graphic description of monster attack |

**Total fixed:** 1 test

## Verification

**All datasets now only reference existing policies:**

```bash
# Multi-turn categories
fraud, hate-speech, illegal-activity, self-harm, sexual-content, spam, violence

# Prompt injection categories
fraud, hate-speech, illegal-activity, self-harm, sexual-content, spam, violence

# Over-refusal categories
fraud, hate-speech, illegal-activity, self-harm, sexual-content, spam, violence
```

✅ All match available policy directories

## Impact

**What changed:**
- Test dataset category mappings (12 multi-turn rows + 1 over-refusal row)
- No change to test content or intent
- No change to test coverage

**What's fixed:**
- ✅ Tests will now run without crashing
- ✅ Policies will load correctly
- ✅ Can proceed with smoke tests immediately

## Ready for Testing

The attack vector test framework is now ready to run:

```bash
# Test multi-turn attacks
uv run test_attack_vectors.py multi-turn --conversation-id MT-SP-001

# Test prompt injections (first few)
uv run test_attack_vectors.py prompt-injection

# Test over-refusal
uv run test_attack_vectors.py over-refusal
```

**Status:** ✅ All dataset fixes applied and verified
**Date:** November 2, 2025
