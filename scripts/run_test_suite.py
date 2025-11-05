#!/usr/bin/env python3
"""
Test Suite Runner for GPT-OSS-Safeguard Testing
Runs tests across multiple categories and aggregates results.
"""

import sys
import os
import subprocess
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import argparse

# Add parent directory to path to import test_safeguard functions
sys.path.insert(0, str(Path(__file__).parent.parent))

from test_safeguard import list_categories


def run_category_test(
    category: str,
    model_name: str = "openai/gpt-oss-safeguard-20b",
    debug_mode: bool = False
) -> Dict:
    """
    Run tests for a single category and return results.

    Args:
        category: Policy category to test
        model_name: Model to use for testing
        debug_mode: Enable debug logging

    Returns:
        Dict with category results including accuracy, metrics, failures
    """
    print(f"\n{'='*60}")
    print(f"Running tests for category: {category}")
    print(f"{'='*60}\n")

    # Build command
    cmd = ["uv", "run", "test_safeguard.py", category, "--model", model_name]
    if debug_mode:
        cmd.append("--debug")

    # Run the test
    start_time = datetime.now()
    result = subprocess.run(cmd, capture_output=True, text=True)
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # Parse the output to find the log file
    log_file = None
    for line in result.stdout.split('\n'):
        if 'Detailed results:' in line:
            # Extract log file path
            parts = line.split('/')
            if parts:
                log_file = '/'.join(parts[-1:]).strip()
                # Find the actual log file
                logs_dir = Path("logs")
                matching_logs = list(logs_dir.glob(f"safeguard_test_{category}_*.jsonl"))
                if matching_logs:
                    # Get the most recent one
                    log_file = str(sorted(matching_logs)[-1])

    # If we couldn't find it from stdout, look for the most recent log file
    if not log_file:
        logs_dir = Path("logs")
        matching_logs = list(logs_dir.glob(f"safeguard_test_{category}_*.jsonl"))
        if matching_logs:
            log_file = str(sorted(matching_logs)[-1])

    # Parse the log file to get results
    if log_file and Path(log_file).exists():
        results = parse_log_file(log_file)
        results["category"] = category
        results["duration_seconds"] = duration
        results["log_file"] = log_file
        return results
    else:
        return {
            "category": category,
            "duration_seconds": duration,
            "error": "Could not find or parse log file",
            "stdout": result.stdout,
            "stderr": result.stderr
        }


def parse_log_file(log_file: str) -> Dict:
    """
    Parse JSONL log file and extract summary statistics.

    Args:
        log_file: Path to JSONL log file

    Returns:
        Dict with parsed results
    """
    results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "accuracy_percent": 0.0,
        "total_cost_usd": 0.0,
        "average_latency_ms": 0.0,
        "failures": []
    }

    try:
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)

                    # Look for session_summary event
                    if entry.get("event_type") == "session_summary":
                        results["total_tests"] = entry.get("results", {}).get("total_tests", 0)
                        results["passed"] = entry.get("results", {}).get("passed", 0)
                        results["failed"] = entry.get("results", {}).get("failed", 0)
                        results["accuracy_percent"] = entry.get("results", {}).get("accuracy_percent", 0.0)
                        results["total_cost_usd"] = entry.get("metrics", {}).get("total_cost_usd", 0.0)
                        results["average_latency_ms"] = entry.get("metrics", {}).get("average_latency_ms", 0.0)
                        results["failures"] = entry.get("failures", [])
                        break
    except Exception as e:
        results["parse_error"] = str(e)

    return results


def run_test_suite(
    categories: Optional[List[str]] = None,
    model_name: str = "openai/gpt-oss-safeguard-20b",
    debug_mode: bool = False,
    compare_baseline: bool = True
) -> Dict:
    """
    Run the full test suite across all or specified categories.

    Args:
        categories: List of categories to test (None = all categories)
        model_name: Model to use for testing
        debug_mode: Enable debug logging
        compare_baseline: Compare results to baseline

    Returns:
        Dict with aggregated results
    """
    # Get categories to test
    if categories is None:
        categories = list_categories()

    print(f"Running test suite for {len(categories)} categories:")
    print(f"  Categories: {', '.join(categories)}")
    print(f"  Model: {model_name}")
    print(f"  Debug mode: {debug_mode}")
    print(f"  Compare baseline: {compare_baseline}\n")

    # Run tests for each category
    suite_start = datetime.now()
    category_results = []

    for category in categories:
        result = run_category_test(category, model_name, debug_mode)
        category_results.append(result)

    suite_end = datetime.now()
    total_duration = (suite_end - suite_start).total_seconds()

    # Aggregate results
    aggregated = aggregate_results(category_results, total_duration)

    # Compare to baseline if requested
    if compare_baseline:
        baseline_comparison = compare_to_baselines(category_results)
        aggregated["baseline_comparison"] = baseline_comparison

    # Save aggregated results
    save_suite_results(aggregated)

    # Print summary
    print_suite_summary(aggregated)

    return aggregated


def aggregate_results(category_results: List[Dict], total_duration: float) -> Dict:
    """
    Aggregate results across all categories.

    Args:
        category_results: List of per-category results
        total_duration: Total suite execution time

    Returns:
        Dict with aggregated statistics
    """
    total_tests = sum(r.get("total_tests", 0) for r in category_results)
    total_passed = sum(r.get("passed", 0) for r in category_results)
    total_failed = sum(r.get("failed", 0) for r in category_results)
    total_cost = sum(r.get("total_cost_usd", 0.0) for r in category_results)

    # Calculate average latency across all tests
    total_latency_sum = sum(
        r.get("average_latency_ms", 0.0) * r.get("total_tests", 0)
        for r in category_results
    )
    avg_latency = total_latency_sum / total_tests if total_tests > 0 else 0.0

    # Collect all failures
    all_failures = []
    for r in category_results:
        category = r.get("category", "unknown")
        for failure in r.get("failures", []):
            all_failures.append({
                "category": category,
                **failure
            })

    return {
        "timestamp": datetime.now().isoformat(),
        "total_duration_seconds": total_duration,
        "categories_tested": len(category_results),
        "summary": {
            "total_tests": total_tests,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "overall_accuracy_percent": (total_passed / total_tests * 100) if total_tests > 0 else 0.0
        },
        "metrics": {
            "total_cost_usd": total_cost,
            "average_latency_ms": avg_latency
        },
        "category_results": category_results,
        "failures": all_failures
    }


def compare_to_baselines(category_results: List[Dict]) -> Dict:
    """
    Compare current results to baseline results.

    Args:
        category_results: List of current category results

    Returns:
        Dict with baseline comparisons
    """
    baselines_dir = Path("baselines")
    comparisons = {}

    for result in category_results:
        category = result.get("category")
        if not category:
            continue

        baseline_file = baselines_dir / f"{category}_baseline.json"

        if baseline_file.exists():
            try:
                with open(baseline_file, 'r') as f:
                    baseline = json.load(f)

                current_accuracy = result.get("accuracy_percent", 0.0)
                baseline_accuracy = baseline.get("accuracy_percent", 0.0)
                accuracy_diff = current_accuracy - baseline_accuracy

                comparisons[category] = {
                    "current_accuracy": current_accuracy,
                    "baseline_accuracy": baseline_accuracy,
                    "accuracy_difference": accuracy_diff,
                    "regression": accuracy_diff < -5.0,  # Flag if accuracy drops by 5%+
                    "baseline_date": baseline.get("timestamp", "unknown")
                }
            except Exception as e:
                comparisons[category] = {
                    "error": f"Failed to load baseline: {str(e)}"
                }
        else:
            comparisons[category] = {
                "status": "no_baseline",
                "message": "No baseline exists for this category"
            }

    return comparisons


def save_suite_results(aggregated: Dict):
    """
    Save aggregated suite results to file.

    Args:
        aggregated: Aggregated results dict
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = Path("logs") / f"test_suite_results_{timestamp}.json"

    with open(results_file, 'w') as f:
        json.dump(aggregated, f, indent=2)

    print(f"\nSuite results saved to: {results_file}")


def print_suite_summary(aggregated: Dict):
    """
    Print formatted summary of test suite results.

    Args:
        aggregated: Aggregated results dict
    """
    print(f"\n{'='*60}")
    print("TEST SUITE SUMMARY")
    print(f"{'='*60}\n")

    summary = aggregated.get("summary", {})
    metrics = aggregated.get("metrics", {})

    print(f"Categories tested: {aggregated.get('categories_tested', 0)}")
    print(f"Total tests: {summary.get('total_tests', 0)}")
    print(f"Passed: {summary.get('total_passed', 0)}")
    print(f"Failed: {summary.get('total_failed', 0)}")
    print(f"Overall accuracy: {summary.get('overall_accuracy_percent', 0.0):.1f}%")
    print(f"Total cost: ${metrics.get('total_cost_usd', 0.0):.4f}")
    print(f"Average latency: {metrics.get('average_latency_ms', 0.0):.1f}ms")
    print(f"Total duration: {aggregated.get('total_duration_seconds', 0.0):.1f}s")

    # Print per-category breakdown
    print(f"\n{'='*60}")
    print("PER-CATEGORY RESULTS")
    print(f"{'='*60}\n")

    for result in aggregated.get("category_results", []):
        category = result.get("category", "unknown")
        accuracy = result.get("accuracy_percent", 0.0)
        tests = result.get("total_tests", 0)
        passed = result.get("passed", 0)
        failed = result.get("failed", 0)

        status = "✓ PASS" if accuracy == 100.0 else f"✗ {failed} FAILURES"
        print(f"{category:20} | {tests:2} tests | {accuracy:5.1f}% | {status}")

    # Print baseline comparison if available
    baseline_comp = aggregated.get("baseline_comparison", {})
    if baseline_comp:
        print(f"\n{'='*60}")
        print("BASELINE COMPARISON")
        print(f"{'='*60}\n")

        regressions = []
        for category, comp in baseline_comp.items():
            if comp.get("regression"):
                regressions.append(category)
                diff = comp.get("accuracy_difference", 0.0)
                print(f"⚠ REGRESSION in {category}: {diff:+.1f}% accuracy change")

        if not regressions:
            print("No regressions detected ✓")

    # Print failures if any
    failures = aggregated.get("failures", [])
    if failures:
        print(f"\n{'='*60}")
        print(f"FAILURES ({len(failures)} total)")
        print(f"{'='*60}\n")

        for failure in failures[:10]:  # Show first 10
            category = failure.get("category", "unknown")
            test_name = failure.get("test_name", "unknown")
            expected = failure.get("expected", "?")
            actual = failure.get("actual", "?")
            print(f"  [{category}] {test_name}")
            print(f"    Expected: {expected}, Got: {actual}")

        if len(failures) > 10:
            print(f"\n  ... and {len(failures) - 10} more failures")


def main():
    """Main entry point for test suite runner."""
    parser = argparse.ArgumentParser(
        description="Run GPT-OSS-Safeguard test suite across multiple categories"
    )
    parser.add_argument(
        "--categories",
        nargs="+",
        help="Specific categories to test (default: all categories)"
    )
    parser.add_argument(
        "--model",
        default="openai/gpt-oss-safeguard-20b",
        help="Model name to use for testing"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug mode logging"
    )
    parser.add_argument(
        "--no-baseline",
        action="store_true",
        help="Skip baseline comparison"
    )
    parser.add_argument(
        "--list-categories",
        action="store_true",
        help="List available categories and exit"
    )

    args = parser.parse_args()

    # List categories if requested
    if args.list_categories:
        categories = list_categories()
        print("Available categories:")
        for category in categories:
            print(f"  - {category}")
        return

    # Run the test suite
    run_test_suite(
        categories=args.categories,
        model_name=args.model,
        debug_mode=args.debug,
        compare_baseline=not args.no_baseline
    )


if __name__ == "__main__":
    main()
