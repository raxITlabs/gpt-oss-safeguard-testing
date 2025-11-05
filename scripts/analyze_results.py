#!/usr/bin/env python3
"""
Results Analysis Tool for GPT-OSS-Safeguard Testing
Analyzes test logs and generates detailed metrics and reports.
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple
from collections import defaultdict


def load_log_file(log_file: Path) -> List[Dict]:
    """
    Load and parse a JSONL log file.

    Args:
        log_file: Path to JSONL log file

    Returns:
        List of parsed log entries
    """
    entries = []
    try:
        with open(log_file, 'r') as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
    except Exception as e:
        print(f"Error loading {log_file}: {e}")

    return entries


def calculate_metrics(entries: List[Dict]) -> Dict:
    """
    Calculate detailed metrics from log entries.

    Args:
        entries: List of log entries

    Returns:
        Dict with calculated metrics
    """
    # Find inference entries
    inferences = [e for e in entries if e.get("event_type") == "inference"]

    if not inferences:
        return {"error": "No inference entries found"}

    # Calculate confusion matrix
    true_positives = 0  # Correctly identified INVALID
    true_negatives = 0  # Correctly identified VALID
    false_positives = 0  # Incorrectly identified INVALID (should be VALID)
    false_negatives = 0  # Incorrectly identified VALID (should be INVALID)

    for inf in inferences:
        result = inf.get("test_result", {})
        expected = result.get("expected", "").upper()
        actual = result.get("actual", "").upper()
        passed = result.get("passed", False)

        if expected == "INVALID" and actual == "INVALID":
            true_positives += 1
        elif expected == "VALID" and actual == "VALID":
            true_negatives += 1
        elif expected == "VALID" and actual == "INVALID":
            false_positives += 1
        elif expected == "INVALID" and actual == "VALID":
            false_negatives += 1

    # Calculate metrics
    total = len(inferences)
    accuracy = (true_positives + true_negatives) / total if total > 0 else 0.0

    # Precision: Of all predicted INVALID, how many were actually INVALID?
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0.0

    # Recall: Of all actual INVALID, how many did we identify?
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0.0

    # F1 Score: Harmonic mean of precision and recall
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    # Cost and latency metrics
    total_cost = sum(inf.get("metrics", {}).get("cost_usd", 0.0) for inf in inferences)
    avg_latency = sum(inf.get("metrics", {}).get("latency_ms", 0.0) for inf in inferences) / total if total > 0 else 0.0

    return {
        "total_tests": total,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "confusion_matrix": {
            "true_positives": true_positives,
            "true_negatives": true_negatives,
            "false_positives": false_positives,
            "false_negatives": false_negatives
        },
        "cost_metrics": {
            "total_cost_usd": total_cost,
            "average_cost_per_test": total_cost / total if total > 0 else 0.0
        },
        "latency_metrics": {
            "average_latency_ms": avg_latency
        }
    }


def analyze_by_severity(entries: List[Dict]) -> Dict:
    """
    Analyze performance by severity level.

    Args:
        entries: List of log entries

    Returns:
        Dict with per-severity metrics
    """
    inferences = [e for e in entries if e.get("event_type") == "inference"]

    # Group by severity level (extracted from test name)
    severity_groups = defaultdict(list)

    for inf in inferences:
        test_name = inf.get("test_name", "")
        # Extract severity level (e.g., "SP0", "HS2", "VL3")
        parts = test_name.split(" - ")
        if parts:
            severity = parts[0]  # e.g., "SP0", "HS3"
            severity_groups[severity].append(inf)

    # Calculate metrics for each severity
    severity_metrics = {}
    for severity, group in severity_groups.items():
        passed = sum(1 for inf in group if inf.get("test_result", {}).get("passed", False))
        total = len(group)
        accuracy = (passed / total * 100) if total > 0 else 0.0

        severity_metrics[severity] = {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "accuracy_percent": accuracy
        }

    return severity_metrics


def identify_failure_patterns(entries: List[Dict]) -> Dict:
    """
    Identify common patterns in failures.

    Args:
        entries: List of log entries

    Returns:
        Dict with failure pattern analysis
    """
    inferences = [e for e in entries if e.get("event_type") == "inference"]
    failures = [inf for inf in inferences if not inf.get("test_result", {}).get("passed", True)]

    if not failures:
        return {"total_failures": 0, "patterns": {}}

    # Analyze failure types
    false_positives = []  # Should be VALID, marked INVALID
    false_negatives = []  # Should be INVALID, marked VALID

    for failure in failures:
        result = failure.get("test_result", {})
        expected = result.get("expected", "").upper()
        actual = result.get("actual", "").upper()

        if expected == "VALID" and actual == "INVALID":
            false_positives.append(failure)
        elif expected == "INVALID" and actual == "VALID":
            false_negatives.append(failure)

    return {
        "total_failures": len(failures),
        "false_positives": {
            "count": len(false_positives),
            "percentage": len(false_positives) / len(failures) * 100 if failures else 0.0,
            "examples": [
                {
                    "test_name": fp.get("test_name"),
                    "content": fp.get("request", {}).get("messages", [{}])[-1].get("content", "")[:100]
                }
                for fp in false_positives[:5]
            ]
        },
        "false_negatives": {
            "count": len(false_negatives),
            "percentage": len(false_negatives) / len(failures) * 100 if failures else 0.0,
            "examples": [
                {
                    "test_name": fn.get("test_name"),
                    "content": fn.get("request", {}).get("messages", [{}])[-1].get("content", "")[:100]
                }
                for fn in false_negatives[:5]
            ]
        }
    }


def analyze_log_file(log_file: Path) -> Dict:
    """
    Perform comprehensive analysis of a log file.

    Args:
        log_file: Path to log file

    Returns:
        Dict with complete analysis
    """
    entries = load_log_file(log_file)

    if not entries:
        return {"error": "No entries found in log file"}

    # Extract metadata
    session_start = next((e for e in entries if e.get("event_type") == "session_start"), {})
    session_summary = next((e for e in entries if e.get("event_type") == "session_summary"), {})

    # Calculate metrics
    metrics = calculate_metrics(entries)
    severity_analysis = analyze_by_severity(entries)
    failure_patterns = identify_failure_patterns(entries)

    return {
        "log_file": str(log_file),
        "timestamp": session_start.get("timestamp"),
        "model": session_start.get("model"),
        "metrics": metrics,
        "severity_analysis": severity_analysis,
        "failure_patterns": failure_patterns,
        "session_summary": session_summary
    }


def compare_log_files(log_files: List[Path]) -> Dict:
    """
    Compare results across multiple log files.

    Args:
        log_files: List of log file paths

    Returns:
        Dict with comparative analysis
    """
    analyses = []

    for log_file in log_files:
        analysis = analyze_log_file(log_file)
        analyses.append(analysis)

    # Extract key metrics for comparison
    comparison = {
        "files_analyzed": len(analyses),
        "comparisons": []
    }

    for analysis in analyses:
        if "error" not in analysis:
            metrics = analysis.get("metrics", {})
            comparison["comparisons"].append({
                "log_file": analysis.get("log_file"),
                "timestamp": analysis.get("timestamp"),
                "accuracy": metrics.get("accuracy", 0.0),
                "precision": metrics.get("precision", 0.0),
                "recall": metrics.get("recall", 0.0),
                "f1_score": metrics.get("f1_score", 0.0)
            })

    return comparison


def print_analysis_report(analysis: Dict):
    """
    Print formatted analysis report.

    Args:
        analysis: Analysis dict
    """
    print(f"\n{'='*60}")
    print("TEST RESULTS ANALYSIS")
    print(f"{'='*60}\n")

    print(f"Log file: {analysis.get('log_file')}")
    print(f"Timestamp: {analysis.get('timestamp')}")
    print(f"Model: {analysis.get('model')}\n")

    # Main metrics
    metrics = analysis.get("metrics", {})
    print(f"{'='*60}")
    print("OVERALL METRICS")
    print(f"{'='*60}\n")

    print(f"Total tests: {metrics.get('total_tests', 0)}")
    print(f"Accuracy: {metrics.get('accuracy', 0.0)*100:.2f}%")
    print(f"Precision: {metrics.get('precision', 0.0)*100:.2f}%")
    print(f"Recall: {metrics.get('recall', 0.0)*100:.2f}%")
    print(f"F1 Score: {metrics.get('f1_score', 0.0)*100:.2f}%\n")

    # Confusion matrix
    cm = metrics.get("confusion_matrix", {})
    print("Confusion Matrix:")
    print(f"  True Positives:  {cm.get('true_positives', 0)}")
    print(f"  True Negatives:  {cm.get('true_negatives', 0)}")
    print(f"  False Positives: {cm.get('false_positives', 0)}")
    print(f"  False Negatives: {cm.get('false_negatives', 0)}\n")

    # Cost metrics
    cost = metrics.get("cost_metrics", {})
    print(f"Total cost: ${cost.get('total_cost_usd', 0.0):.4f}")
    print(f"Average cost per test: ${cost.get('average_cost_per_test', 0.0):.4f}\n")

    # Latency
    latency = metrics.get("latency_metrics", {})
    print(f"Average latency: {latency.get('average_latency_ms', 0.0):.1f}ms\n")

    # Severity analysis
    severity = analysis.get("severity_analysis", {})
    if severity:
        print(f"{'='*60}")
        print("SEVERITY LEVEL BREAKDOWN")
        print(f"{'='*60}\n")

        for level, stats in sorted(severity.items()):
            accuracy = stats.get("accuracy_percent", 0.0)
            total = stats.get("total_tests", 0)
            status = "✓" if accuracy == 100.0 else "✗"
            print(f"{status} {level:10} | {total:2} tests | {accuracy:5.1f}% accuracy")

        print()

    # Failure patterns
    failures = analysis.get("failure_patterns", {})
    if failures.get("total_failures", 0) > 0:
        print(f"{'='*60}")
        print("FAILURE ANALYSIS")
        print(f"{'='*60}\n")

        print(f"Total failures: {failures.get('total_failures', 0)}\n")

        fp = failures.get("false_positives", {})
        fn = failures.get("false_negatives", {})

        print(f"False Positives (marked INVALID, should be VALID): {fp.get('count', 0)} ({fp.get('percentage', 0.0):.1f}%)")
        if fp.get("examples"):
            print("  Examples:")
            for ex in fp.get("examples", []):
                print(f"    - {ex.get('test_name')}")

        print(f"\nFalse Negatives (marked VALID, should be INVALID): {fn.get('count', 0)} ({fn.get('percentage', 0.0):.1f}%)")
        if fn.get("examples"):
            print("  Examples:")
            for ex in fn.get("examples", []):
                print(f"    - {ex.get('test_name')}")


def save_analysis(analysis: Dict, output_file: Path):
    """
    Save analysis to JSON file.

    Args:
        analysis: Analysis dict
        output_file: Output file path
    """
    with open(output_file, 'w') as f:
        json.dump(analysis, f, indent=2)

    print(f"\nAnalysis saved to: {output_file}")


def main():
    """Main entry point for results analyzer."""
    parser = argparse.ArgumentParser(
        description="Analyze GPT-OSS-Safeguard test results"
    )
    parser.add_argument(
        "log_file",
        nargs="?",
        help="Path to JSONL log file to analyze (defaults to most recent)"
    )
    parser.add_argument(
        "--compare",
        nargs="+",
        help="Compare multiple log files"
    )
    parser.add_argument(
        "--output",
        help="Save analysis to JSON file"
    )
    parser.add_argument(
        "--category",
        help="Analyze most recent log for specific category"
    )

    args = parser.parse_args()

    # Determine which log file(s) to analyze
    if args.compare:
        # Compare multiple files
        log_files = [Path(f) for f in args.compare]
        comparison = compare_log_files(log_files)
        print(json.dumps(comparison, indent=2))
        return

    # Single file analysis
    if args.log_file:
        log_file = Path(args.log_file)
    elif args.category:
        # Find most recent log for category
        logs_dir = Path("logs")
        matching = list(logs_dir.glob(f"safeguard_test_{args.category}_*.jsonl"))
        if not matching:
            print(f"No logs found for category: {args.category}")
            return
        log_file = sorted(matching)[-1]
        print(f"Analyzing most recent log for {args.category}: {log_file}\n")
    else:
        # Find most recent log overall
        logs_dir = Path("logs")
        all_logs = list(logs_dir.glob("safeguard_test_*.jsonl"))
        if not all_logs:
            print("No log files found")
            return
        log_file = sorted(all_logs)[-1]
        print(f"Analyzing most recent log: {log_file}\n")

    # Perform analysis
    analysis = analyze_log_file(log_file)

    # Print report
    print_analysis_report(analysis)

    # Save if requested
    if args.output:
        save_analysis(analysis, Path(args.output))


if __name__ == "__main__":
    main()
