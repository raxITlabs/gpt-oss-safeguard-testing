#!/usr/bin/env python3
"""
Baseline Saver for GPT-OSS-Safeguard Testing
Saves test results as baseline for future comparison.
"""

import json
import argparse
from pathlib import Path
from datetime import datetime


def load_log_summary(log_file: Path) -> dict:
    """
    Load session summary from log file.

    Args:
        log_file: Path to JSONL log file

    Returns:
        Session summary dict
    """
    try:
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    entry = json.loads(line)
                    if entry.get("event_type") == "session_summary":
                        return entry
    except Exception as e:
        print(f"Error loading log file: {e}")

    return {}


def save_baseline(log_file: Path, category: str, force: bool = False):
    """
    Save test results as baseline.

    Args:
        log_file: Path to log file
        category: Category name
        force: Overwrite existing baseline
    """
    baseline_file = Path("baselines") / f"{category}_baseline.json"

    # Check if baseline exists
    if baseline_file.exists() and not force:
        print(f"Baseline already exists for {category}: {baseline_file}")
        print("Use --force to overwrite")
        return

    # Load log summary
    summary = load_log_summary(log_file)

    if not summary:
        print(f"Could not find session summary in {log_file}")
        return

    # Extract key metrics
    results = summary.get("results", {})
    metrics = summary.get("metrics", {})

    baseline = {
        "category": category,
        "timestamp": summary.get("timestamp", datetime.now().isoformat()),
        "model": summary.get("model", "unknown"),
        "log_file": str(log_file),
        "total_tests": results.get("total_tests", 0),
        "passed": results.get("passed", 0),
        "failed": results.get("failed", 0),
        "accuracy_percent": results.get("accuracy_percent", 0.0),
        "total_cost_usd": metrics.get("total_cost_usd", 0.0),
        "average_latency_ms": metrics.get("average_latency_ms", 0.0),
        "failures": summary.get("failures", [])
    }

    # Save baseline
    baseline_file.parent.mkdir(parents=True, exist_ok=True)

    with open(baseline_file, 'w') as f:
        json.dump(baseline, f, indent=2)

    print(f"✓ Baseline saved for {category}")
    print(f"  File: {baseline_file}")
    print(f"  Accuracy: {baseline['accuracy_percent']:.1f}%")
    print(f"  Tests: {baseline['total_tests']} total, {baseline['passed']} passed, {baseline['failed']} failed")


def main():
    """Main entry point for baseline saver."""
    parser = argparse.ArgumentParser(
        description="Save test results as baseline for future comparison"
    )
    parser.add_argument(
        "category",
        nargs="?",
        help="Category to save baseline for (will find most recent log)"
    )
    parser.add_argument(
        "--log-file",
        help="Specific log file to use as baseline"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing baseline"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Save baselines for all categories from most recent logs"
    )

    args = parser.parse_args()

    if args.all:
        # Save baselines for all categories
        logs_dir = Path("logs")
        categories = set()

        # Find all unique categories
        for log_file in logs_dir.glob("safeguard_test_*.jsonl"):
            # Extract category from filename
            parts = log_file.stem.split("_")
            if len(parts) >= 3:
                category = parts[2]
                categories.add(category)

        print(f"Found {len(categories)} categories: {', '.join(sorted(categories))}\n")

        for category in sorted(categories):
            # Find most recent log for this category
            matching_logs = list(logs_dir.glob(f"safeguard_test_{category}_*.jsonl"))
            if matching_logs:
                most_recent = sorted(matching_logs)[-1]
                print(f"\nProcessing {category}:")
                print(f"  Using log: {most_recent}")
                save_baseline(most_recent, category, args.force)

    elif args.log_file:
        # Use specific log file
        log_file = Path(args.log_file)

        # Extract category from filename or use provided
        if args.category:
            category = args.category
        else:
            # Try to extract from filename
            parts = log_file.stem.split("_")
            if len(parts) >= 3:
                category = parts[2]
            else:
                print("Could not determine category from filename. Please specify with category argument.")
                return

        save_baseline(log_file, category, args.force)

    elif args.category:
        # Find most recent log for category
        logs_dir = Path("logs")
        matching_logs = list(logs_dir.glob(f"safeguard_test_{args.category}_*.jsonl"))

        if not matching_logs:
            print(f"No logs found for category: {args.category}")
            return

        most_recent = sorted(matching_logs)[-1]
        print(f"Using most recent log: {most_recent}\n")
        save_baseline(most_recent, args.category, args.force)

    else:
        print("Error: Must specify --category, --log-file, or --all")
        parser.print_help()


if __name__ == "__main__":
    main()
