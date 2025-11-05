#!/usr/bin/env python3
"""
Log Viewer for gpt-oss-safeguard test results.
Displays JSONL logs in beautiful, formatted tables using Rich.
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict, Optional

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box
from rich.text import Text


console = Console()


def find_latest_log(debug: bool = False) -> Optional[Path]:
    """Find the most recent log file in the logs directory."""
    logs_dir = Path("logs")
    if not logs_dir.exists():
        return None

    pattern = "safeguard_debug_*.jsonl" if debug else "safeguard_test_*.jsonl"
    log_files = list(logs_dir.glob(pattern))
    if not log_files:
        return None

    # Sort by modification time, most recent first
    return max(log_files, key=lambda p: p.stat().st_mtime)


def load_logs(log_file: Path, is_debug: bool = False) -> Dict[str, List[Dict]]:
    """Load and parse JSONL log file, grouping by event type."""
    if is_debug:
        logs = {
            "debug_session_start": [],
            "debug_inference": [],
            "error": []
        }
    else:
        logs = {
            "session_start": [],
            "inference": [],
            "session_summary": [],
            "error": []
        }

    with open(log_file, 'r') as f:
        for line in f:
            if line.strip():
                entry = json.loads(line)
                event_type = entry.get("event_type", "unknown")
                if event_type in logs:
                    logs[event_type].append(entry)

    return logs


def display_debug_log(logs: Dict[str, List[Dict]]) -> None:
    """Display debug logs with raw API responses in a formatted way."""
    console.print("\n[bold cyan]═══════════════════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print("[bold cyan]                            DEBUG LOG VIEWER                                   [/bold cyan]")
    console.print("[bold cyan]═══════════════════════════════════════════════════════════════════════════════[/bold cyan]\n")

    # Show debug session info
    if logs["debug_session_start"]:
        session = logs["debug_session_start"][0]
        console.print(Panel(
            f"[bold]Timestamp:[/bold] {session.get('timestamp')}\n"
            f"[bold]Debug Log File:[/bold] {session.get('debug_log_file')}\n"
            f"[bold]Mode:[/bold] {session.get('mode')}",
            title="Debug Session Info",
            border_style="cyan"
        ))
        console.print()

    # Show debug inference entries
    if logs["debug_inference"]:
        for debug_entry in logs["debug_inference"]:
            test_num = debug_entry.get("test_number")
            test_name = debug_entry.get("test_name")

            console.print(f"\n[bold yellow]{'─' * 80}[/bold yellow]")
            console.print(f"[bold yellow]Test #{test_num}: {test_name}[/bold yellow]")
            console.print(f"[bold yellow]{'─' * 80}[/bold yellow]\n")

            # Request section
            console.print("[bold cyan]REQUEST:[/bold cyan]")
            request = debug_entry.get("request", {})
            console.print(Panel(
                json.dumps(request, indent=2),
                title="Full Request Payload",
                border_style="blue",
                expand=False
            ))
            console.print()

            # Raw Response section
            console.print("[bold green]RAW API RESPONSE:[/bold green]")
            response_raw = debug_entry.get("response_raw", {})
            console.print(Panel(
                json.dumps(response_raw, indent=2, default=str),
                title="Complete Response Object",
                border_style="green",
                expand=False
            ))
            console.print()

            # Extracted fields
            console.print("[bold magenta]EXTRACTED FIELDS:[/bold magenta]")
            extracted = debug_entry.get("response_extracted", {})
            usage = debug_entry.get("usage", {})
            metrics = debug_entry.get("metrics", {})
            test_result = debug_entry.get("test_result", {})

            extracted_table = Table(show_header=False, box=box.ROUNDED, border_style="magenta")
            extracted_table.add_column("Field", style="bold")
            extracted_table.add_column("Value")

            extracted_table.add_row("Content", extracted.get("content", ""))
            extracted_table.add_row("Finish Reason", extracted.get("finish_reason", ""))
            extracted_table.add_row("Model", extracted.get("model", ""))
            extracted_table.add_row("Response ID", extracted.get("id", ""))
            extracted_table.add_row("", "")
            extracted_table.add_row("Prompt Tokens", str(usage.get("prompt_tokens", 0)))
            extracted_table.add_row("Completion Tokens", str(usage.get("completion_tokens", 0)))
            extracted_table.add_row("Total Tokens", str(usage.get("total_tokens", 0)))
            extracted_table.add_row("", "")
            extracted_table.add_row("Latency", f"{metrics.get('latency_ms', 0)}ms")
            extracted_table.add_row("Cost", f"${metrics.get('cost_usd', 0):.8f}")
            extracted_table.add_row("", "")

            passed = test_result.get("passed", False)
            status_text = Text("✓ PASS", style="bold green") if passed else Text("✗ FAIL", style="bold red")
            extracted_table.add_row("Expected", test_result.get("expected", ""))
            extracted_table.add_row("Actual", test_result.get("actual", ""))
            extracted_table.add_row("Status", status_text)

            console.print(extracted_table)
            console.print()

    # Show errors if any
    if logs["error"]:
        console.print(f"\n[bold red]⚠ {len(logs['error'])} Error(s) Found:[/bold red]\n")
        for error in logs["error"]:
            console.print(Panel(
                json.dumps(error, indent=2),
                title=f"Error in Test {error.get('test_number')}",
                border_style="red"
            ))


def create_summary_table(summary: Dict) -> Table:
    """Create a summary table from session_summary event."""
    table = Table(
        title="📊 Test Session Summary",
        box=box.ROUNDED,
        show_header=False,
        title_style="bold cyan"
    )

    table.add_column("Metric", style="bold yellow", width=20)
    table.add_column("Value", style="white")

    # Model info
    table.add_row("Model", summary.get("model", "N/A"))

    # Results
    results = summary.get("results", {})
    total = results.get("total_tests", 0)
    passed = results.get("passed", 0)
    failed = results.get("failed", 0)
    accuracy = results.get("accuracy_percent", 0)

    status_text = Text()
    status_text.append(f"{total} ", style="white")
    status_text.append(f"({passed} passed", style="green")
    status_text.append(f", {failed} failed)", style="red" if failed > 0 else "green")
    table.add_row("Tests", status_text)
    table.add_row("Accuracy", f"{accuracy:.1f}%", style="green bold" if accuracy == 100 else "yellow")

    # Tokens
    usage = summary.get("usage", {})
    prompt_tokens = usage.get("total_prompt_tokens", 0)
    completion_tokens = usage.get("total_completion_tokens", 0)
    total_tokens = usage.get("total_tokens", 0)
    table.add_row(
        "Tokens",
        f"{total_tokens:,} ({prompt_tokens:,} prompt + {completion_tokens:,} completion)"
    )

    # Cost & Performance
    metrics = summary.get("metrics", {})
    total_cost = metrics.get("total_cost_usd", 0)
    avg_latency = metrics.get("average_latency_ms", 0)

    cost_style = "green" if total_cost < 0.01 else "yellow"
    table.add_row("Total Cost", f"${total_cost:.6f}", style=cost_style)
    table.add_row("Avg Latency", f"{avg_latency:.0f}ms")

    # Timestamp
    timestamp = summary.get("timestamp", "N/A")
    if timestamp != "N/A":
        # Format timestamp to be more readable
        timestamp = timestamp.replace("T", " ").split(".")[0]
    table.add_row("Completed", timestamp, style="dim")

    return table


def create_results_table(inferences: List[Dict], show_full_names: bool = False) -> Table:
    """Create a detailed results table from inference events."""
    table = Table(
        title="🧪 Test Results",
        box=box.ROUNDED,
        title_style="bold cyan",
        show_lines=False
    )

    # Add columns
    table.add_column("#", justify="center", style="cyan", width=4, no_wrap=True)
    table.add_column("Test Name", style="white", min_width=20, max_width=40 if not show_full_names else None, overflow="fold")
    table.add_column("Expected", justify="center", width=10, no_wrap=True)
    table.add_column("Actual", justify="center", width=10, no_wrap=True)
    table.add_column("Status", justify="center", width=10, no_wrap=True)
    table.add_column("Tokens", justify="right", width=7, no_wrap=True)
    table.add_column("Cost", justify="right", width=10, no_wrap=True)
    table.add_column("Latency", justify="right", width=8, no_wrap=True)

    # Add rows
    for inference in inferences:
        test_num = str(inference.get("test_number", "?"))
        test_name = inference.get("test_name", "Unknown")

        test_result = inference.get("test_result", {})
        expected = test_result.get("expected", "?")
        actual = test_result.get("actual", "?")
        passed = test_result.get("passed", False)

        usage = inference.get("usage", {})
        total_tokens = usage.get("total_tokens", 0)

        metrics = inference.get("metrics", {})
        cost = metrics.get("cost_usd", 0)
        latency = metrics.get("latency_ms", 0)

        # Style based on pass/fail
        if passed:
            status = Text("✓ PASS", style="bold green")
            expected_style = "green"
            actual_style = "green"
        else:
            status = Text("✗ FAIL", style="bold red")
            expected_style = "yellow"
            actual_style = "red"

        table.add_row(
            test_num,
            test_name,
            Text(expected, style=expected_style),
            Text(actual, style=actual_style),
            status,
            f"{total_tokens:,}",
            f"${cost:.5f}",
            f"{latency:.0f}ms"
        )

    return table


def create_detailed_view(inference: Dict) -> Panel:
    """Create a detailed panel view for a single inference event."""
    test_name = inference.get("test_name", "Unknown")

    # Build content
    content = []

    # Request
    request = inference.get("request", {})
    messages = request.get("messages", [])
    user_content = next((m["content"] for m in messages if m.get("role") == "user"), "N/A")
    content.append(f"[bold yellow]Content:[/bold yellow] {user_content}\n")

    # Response
    response = inference.get("response", {})
    response_content = response.get("content", "N/A")
    content.append(f"[bold cyan]Response:[/bold cyan] {response_content}\n")

    # Test Result
    test_result = inference.get("test_result", {})
    expected = test_result.get("expected", "?")
    actual = test_result.get("actual", "?")
    passed = test_result.get("passed", False)

    status_color = "green" if passed else "red"
    content.append(f"[bold]Expected:[/bold] {expected}")
    content.append(f"[bold]Actual:[/bold] [{status_color}]{actual}[/{status_color}]\n")

    # Reasoning (if available)
    reasoning = inference.get("reasoning")
    if reasoning:
        content.append(f"[bold magenta]Reasoning:[/bold magenta]")
        content.append(f"[italic]{reasoning}[/italic]\n")

    # Metrics
    usage = inference.get("usage", {})
    metrics = inference.get("metrics", {})
    content.append(f"[dim]Tokens: {usage.get('total_tokens', 0)} | "
                  f"Cost: ${metrics.get('cost_usd', 0):.6f} | "
                  f"Latency: {metrics.get('latency_ms', 0):.0f}ms[/dim]")

    panel = Panel(
        "\n".join(content),
        title=f"Test #{inference.get('test_number', '?')}: {test_name}",
        border_style=status_color
    )

    return panel


def main():
    parser = argparse.ArgumentParser(
        description="View gpt-oss-safeguard test logs in beautiful tables"
    )
    parser.add_argument(
        "file",
        nargs="?",
        help="Path to log file (default: latest in logs/)"
    )
    parser.add_argument(
        "--summary-only",
        action="store_true",
        help="Show only the summary table"
    )
    parser.add_argument(
        "--detailed",
        action="store_true",
        help="Show detailed view of each test case"
    )
    parser.add_argument(
        "--filter",
        choices=["session_start", "inference", "session_summary", "error"],
        help="Filter by event type"
    )
    parser.add_argument(
        "--full-names",
        action="store_true",
        help="Don't truncate test names in table"
    )
    parser.add_argument(
        "--debug-log",
        action="store_true",
        help="View debug log with raw API responses (from --debug mode runs)"
    )

    args = parser.parse_args()

    # Determine log file
    if args.file:
        log_file = Path(args.file)
    else:
        log_file = find_latest_log(debug=args.debug_log)

    if not log_file or not log_file.exists():
        log_type = "debug log" if args.debug_log else "log"
        console.print(f"[bold red]Error:[/bold red] No {log_type} file found", style="red")
        console.print("\n[dim]Run test_safeguard.py with --debug to generate debug logs.[/dim]" if args.debug_log else "\n[dim]Run test_safeguard.py to generate logs first.[/dim]")
        return

    console.print(f"\n[bold]Reading log file:[/bold] {log_file}\n", style="cyan")

    # Load logs
    try:
        logs = load_logs(log_file, is_debug=args.debug_log)
    except Exception as e:
        console.print(f"[bold red]Error loading logs:[/bold red] {e}")
        return

    # If debug log, use special display
    if args.debug_log:
        display_debug_log(logs)
        return

    # Display based on arguments
    if args.filter:
        # Show only filtered events
        filtered = logs.get(args.filter, [])
        console.print(json.dumps(filtered, indent=2))
        return

    # Show summary table
    if logs["session_summary"]:
        summary = logs["session_summary"][0]
        summary_table = create_summary_table(summary)
        console.print(summary_table)
        console.print()

    # Show results table (unless summary-only)
    if not args.summary_only and logs["inference"]:
        results_table = create_results_table(logs["inference"], args.full_names)
        console.print(results_table)
        console.print()

    # Show detailed view if requested
    if args.detailed and logs["inference"]:
        console.print("[bold cyan]Detailed Test Views:[/bold cyan]\n")
        for inference in logs["inference"]:
            panel = create_detailed_view(inference)
            console.print(panel)
            console.print()

    # Show errors if any
    if logs["error"]:
        console.print(f"[bold red]⚠ {len(logs['error'])} Error(s) Found:[/bold red]\n")
        for error in logs["error"]:
            console.print(f"  Test {error.get('test_number')}: {error.get('error')}")
        console.print()


if __name__ == "__main__":
    main()
