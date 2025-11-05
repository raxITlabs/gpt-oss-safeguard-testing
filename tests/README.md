# Test Suite for test_safeguard.py

Comprehensive pytest test suite with 60 tests covering all functionality of the unified `test_safeguard.py` CLI tool.

## Quick Start

```bash
# Run all tests
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ -v --cov=test_safeguard --cov-report=term-missing

# Run specific test class
uv run pytest tests/test_safeguard_cli.py::TestLoggingFunctions -v

# Run tests matching pattern
uv run pytest tests/ -v -k "truncation"
```

## Test Coverage

**60 tests** organized into 6 categories:

1. **Unit Tests (15)** - Utility functions, logging, cost calculation
2. **Integration Tests (8)** - Attack vector loaders
3. **Function Tests (12)** - Test runners
4. **CLI Tests (10)** - Argument parsing
5. **Error Handling (10)** - Edge cases and errors
6. **E2E Tests (5)** - Full workflow integration

## Critical Tests

**8 tests** specifically verify **NO content truncation** in logs:

- `test_log_to_jsonl_no_truncation`
- `test_load_multi_turn_tests_no_truncation`
- `test_load_injection_tests_no_truncation`
- `test_load_overrefusal_tests_no_truncation`
- `test_baseline_logging_full_content`
- `test_multi_turn_logging_full_turns`
- `test_prompt_injection_logging`
- `test_e2e_full_content_in_logs`

All verify content > 200 characters is logged completely.

## File Structure

```
tests/
├── __init__.py                     # Package marker
├── README.md                       # This file
├── conftest.py                     # Pytest fixtures
├── test_safeguard_cli.py           # Main test suite (60 tests)
├── fixtures/
│   ├── mock_policies/              # Test policy files
│   │   └── spam/policy.txt
│   ├── mock_datasets/              # Test CSV files
│   │   └── spam/tests.csv
│   └── mock_responses.json         # Mock API responses
```

## Results

```
============================== 60 passed in 0.58s ==============================
```

**Pass Rate:** 100% (60/60)
**Coverage:** 36% of test_safeguard.py
**Execution Time:** 0.58 seconds

## Dependencies

```toml
[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "pytest-mock>=3.12.0",
    "pytest-cov>=4.1.0",
]
```

Install via: `uv sync`

## Documentation

See `TEST_SUITE_SUMMARY.md` in the root directory for comprehensive documentation.
