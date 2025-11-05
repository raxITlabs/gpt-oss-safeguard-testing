#!/usr/bin/env python3
"""
GPT-OSS-Safeguard Testing CLI

A comprehensive command-line interface for testing the GPT-OSS-Safeguard model
against various policy categories and attack vectors.

Usage:
    safeguard-test                    # Interactive mode (default)
    safeguard-test test spam          # Run spam category tests
    safeguard-test test --attack multi-turn  # Run attack tests
    safeguard-test list categories    # List available categories
    safeguard-test logs               # View test logs
"""

import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich import print as rprint

# Import test functions from test_safeguard.py
from test_safeguard import (
    test_baseline,
    test_multi_turn,
    test_prompt_injection,
    test_over_refusal,
    load_baseline_tests,
    load_multi_turn_tests,
    load_injection_tests,
    load_overrefusal_tests,
    load_policy,
    list_categories,
)
from openai import OpenAI
from datetime import datetime
import os

console = Console()

# Version
__version__ = "0.1.0"


# ============================================================================
# Setup Helper Functions
# ============================================================================

def setup_openai_client() -> OpenAI:
    """Set up OpenRouter client"""
    from dotenv import load_dotenv
    load_dotenv()

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        console.print("[red]Error:[/red] OPENROUTER_API_KEY not found in environment")
        console.print("Please set it in .env file or environment variables")
        raise click.Abort()

    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key
    )


def create_log_file(test_type: str, category: str) -> Path:
    """Create log file path"""
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if category:
        filename = f"safeguard_test_{category}_{timestamp}.jsonl"
    else:
        filename = f"safeguard_test_{test_type}_{timestamp}.jsonl"

    return logs_dir / filename


@click.group(invoke_without_command=True)
@click.pass_context
@click.version_option(version=__version__, prog_name="safeguard-test")
def cli(ctx):
    """
    GPT-OSS-Safeguard Testing CLI

    Test LLM safeguard policies against various categories and attack vectors.

    \b
    Examples:
        safeguard-test                      # Interactive mode
        safeguard-test test spam            # Run spam tests
        safeguard-test test --attack multi-turn  # Run attack tests
        safeguard-test list categories      # Show all categories
        safeguard-test logs                 # View recent logs

    For more information, visit: https://github.com/raxitlabs/gpt-oss-safeguard-testing
    """
    if ctx.invoked_subcommand is None:
        # No subcommand provided - run interactive mode
        ctx.invoke(interactive)


@cli.command()
@click.argument('category', required=False, type=str)
@click.option('--attack', type=click.Choice(['multi-turn', 'prompt-injection', 'over-refusal']),
              help='Run specific attack type tests')
@click.option('--all', 'run_all', is_flag=True, help='Run all baseline categories and all attack types')
@click.option('--number', type=int, help='Run single test number (baseline only)')
@click.option('--conversation-id', type=str, help='Specific multi-turn conversation ID')
@click.option('--test-id', type=str, help='Specific injection/over-refusal test ID')
@click.option('--debug/--no-debug', default=False, help='Enable debug mode')
@click.option('--show-full/--truncate', default=False, help='Show full content in output')
@click.option('--model', default='openai/gpt-oss-safeguard-20b', help='OpenRouter model name')
def test(category, attack, run_all, number, conversation_id, test_id, debug, show_full, model):
    """
    Run safeguard tests

    Run tests for a specific policy category or attack type.

    \b
    Categories:
        spam, hate-speech, violence, sexual-content, self-harm,
        fraud, illegal-activity, unicode

    \b
    Attack Types:
        multi-turn        - Conversation-based attacks
        prompt-injection  - System prompt manipulation
        over-refusal      - False positive detection

    \b
    Examples:
        safeguard-test test spam                # All spam tests
        safeguard-test test spam --number 5     # Test #5 only
        safeguard-test test --attack multi-turn # Multi-turn attacks
        safeguard-test test --attack prompt-injection --test-id PI-001
        safeguard-test test --all               # Run ALL tests (categories + attacks)
    """
    # Validate options
    if run_all and (category or attack):
        console.print("[red]Error:[/red] --all cannot be combined with specific category or attack type")
        raise click.Abort()

    if not category and not attack and not run_all:
        console.print("[red]Error:[/red] Must specify either a category, --attack type, or --all")
        console.print("Use [cyan]safeguard-test test --help[/cyan] for usage information")
        raise click.Abort()

    # Setup
    client = setup_openai_client()

    if run_all:
        # Run everything
        _run_all_tests(client, model, debug, show_full)
    elif attack:
        # Run attack-type tests
        _run_attack_tests(attack, client, model, conversation_id, test_id, show_full)
    else:
        # Run baseline category tests
        _run_baseline_tests(category, client, model, number, debug, show_full)


@cli.command()
def interactive():
    """
    Interactive mode with menu-driven interface

    Launch an interactive menu to select test categories, configure options,
    and run tests with a guided interface.
    """
    console.clear()
    console.print(Panel.fit(
        "[bold cyan]GPT-OSS-Safeguard Testing Framework[/bold cyan]\n"
        "[dim]Interactive Mode[/dim]",
        border_style="cyan"
    ))

    while True:
        console.print("\n[bold]Main Menu[/bold]")
        console.print("1. Run Baseline Category Tests")
        console.print("2. Run Attack-Type Tests")
        console.print("3. List Available Options")
        console.print("4. View Logs")
        console.print("5. Exit")

        choice = Prompt.ask("\nSelect an option", choices=["1", "2", "3", "4", "5"], default="1")

        if choice == "1":
            _interactive_baseline_tests()
        elif choice == "2":
            _interactive_attack_tests()
        elif choice == "3":
            _interactive_list_options()
        elif choice == "4":
            _interactive_view_logs()
        elif choice == "5":
            console.print("[green]Goodbye![/green]")
            break


@cli.group()
def list():
    """List available test options"""
    pass


@list.command()
def categories():
    """List all available test categories"""
    cats = list_categories()

    table = Table(title="Available Test Categories", show_header=True, header_style="bold cyan")
    table.add_column("Category", style="cyan")
    table.add_column("Description", style="white")

    descriptions = {
        "spam": "Unsolicited promotional content, bulk messaging",
        "hate-speech": "Attacks on protected groups and attributes",
        "violence": "Graphic content, threats, glorification",
        "sexual-content": "CSAM, adult content, exploitation",
        "self-harm": "Suicide, self-injury content",
        "fraud": "Scams, phishing, deceptive practices",
        "illegal-activity": "Drug trafficking, weapons, illegal services",
        "unicode": "Unicode obfuscation attacks"
    }

    for cat in cats:
        table.add_row(cat, descriptions.get(cat, ""))

    console.print(table)


@list.command()
def attacks():
    """List all available attack types"""
    table = Table(title="Available Attack Types", show_header=True, header_style="bold cyan")
    table.add_column("Attack Type", style="cyan")
    table.add_column("Description", style="white")

    table.add_row("multi-turn", "Conversation-based attacks using multi-turn dialogue")
    table.add_row("prompt-injection", "System prompt manipulation and jailbreak attempts")
    table.add_row("over-refusal", "False positive detection on legitimate content")

    console.print(table)


@cli.command()
@click.argument('log_file', required=False, type=click.Path(exists=True))
def logs(log_file):
    """
    View test logs interactively

    Display test logs with syntax highlighting and formatting.
    If no log file specified, shows the most recent log.

    \b
    Examples:
        safeguard-test logs                      # Most recent log
        safeguard-test logs logs/test_spam.jsonl  # Specific log
    """
    from view_logs import main as view_logs_main

    if log_file:
        # View specific log file
        import sys
        sys.argv = ['view_logs.py', log_file]
        view_logs_main()
    else:
        # Find and view most recent log
        logs_dir = Path("logs")
        if not logs_dir.exists():
            console.print("[yellow]No logs directory found[/yellow]")
            return

        log_files = sorted(logs_dir.glob("*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not log_files:
            console.print("[yellow]No log files found[/yellow]")
            return

        most_recent = log_files[0]
        console.print(f"[cyan]Viewing:[/cyan] {most_recent}")
        import sys
        sys.argv = ['view_logs.py', str(most_recent)]
        view_logs_main()


# ============================================================================
# Helper Functions
# ============================================================================

def _run_baseline_tests(category, client, model, test_number, debug, show_full):
    """Run baseline category tests"""
    # Validate category
    categories = list_categories()
    if category not in categories:
        console.print(f"[red]Error:[/red] Unknown category '{category}'")
        console.print(f"Available categories: {', '.join(categories)}")
        raise click.Abort()

    # Load test data
    test_cases = load_baseline_tests(category)
    policy = load_policy(category)
    log_file = create_log_file("baseline", category)
    debug_log_file = log_file.with_suffix('.debug.jsonl')

    # Run tests
    console.print(f"\n[cyan]Running {category} tests...[/cyan]")
    results = test_baseline(
        category=category,
        test_cases=test_cases,
        policy=policy,
        client=client,
        model_name=model,
        log_file=log_file,
        debug_log_file=debug_log_file,
        debug_mode=debug,
        test_number=test_number,
        show_full_content=show_full
    )

    _display_results_summary(results)


def _run_attack_tests(attack_type, client, model, conversation_id, test_id, show_full):
    """Run attack-type tests"""
    log_file = create_log_file(attack_type.replace('-', '_'), "")
    debug_log_file = log_file.with_suffix('.debug.jsonl')

    if attack_type == 'multi-turn':
        conversations = load_multi_turn_tests()
        console.print(f"\n[cyan]Running multi-turn attack tests...[/cyan]")
        results = test_multi_turn(
            conversations=conversations,
            client=client,
            model_name=model,
            log_file=log_file,
            debug_log_file=debug_log_file,
            conversation_id=conversation_id,
            show_full_content=show_full
        )
    elif attack_type == 'prompt-injection':
        tests = load_injection_tests()
        console.print(f"\n[cyan]Running prompt injection tests...[/cyan]")
        results = test_prompt_injection(
            tests=tests,
            client=client,
            model_name=model,
            log_file=log_file,
            debug_log_file=debug_log_file,
            test_id=test_id,
            show_full_content=show_full
        )
    else:  # over-refusal
        tests = load_overrefusal_tests()
        console.print(f"\n[cyan]Running over-refusal detection tests...[/cyan]")
        results = test_over_refusal(
            tests=tests,
            client=client,
            model_name=model,
            log_file=log_file,
            debug_log_file=debug_log_file,
            show_full_content=show_full
        )

    _display_results_summary(results)


def _run_all_tests(client, model, debug, show_full):
    """Run all baseline categories and all attack types"""
    from datetime import datetime

    console.print(Panel.fit(
        "[bold cyan]Running ALL Tests[/bold cyan]\n"
        "[dim]This will run all baseline categories and all attack types[/dim]",
        border_style="cyan"
    ))

    # Track overall statistics
    start_time = datetime.now()
    all_results = {
        'baseline': [],
        'attacks': []
    }
    total_cost = 0.0
    total_tests = 0
    total_passed = 0
    total_failed = 0

    # Run all baseline categories
    categories = list_categories()
    console.print(f"\n[bold]Running {len(categories)} baseline categories...[/bold]\n")

    for i, category in enumerate(categories, 1):
        console.print(f"[cyan]({i}/{len(categories)})[/cyan] Testing category: {category}")
        try:
            test_cases = load_baseline_tests(category)
            policy = load_policy(category)
            log_file = create_log_file("baseline", category)
            debug_log_file = log_file.with_suffix('.debug.jsonl')

            results = test_baseline(
                category=category,
                test_cases=test_cases,
                policy=policy,
                client=client,
                model_name=model,
                log_file=log_file,
                debug_log_file=debug_log_file,
                debug_mode=debug,
                show_full_content=show_full
            )

            all_results['baseline'].append({
                'category': category,
                'results': results
            })

            total_cost += results.get('cost', 0)
            total_tests += results.get('total_tests', 0)
            total_passed += results.get('passed', 0)
            total_failed += results.get('failed', 0)

            # Show quick summary
            accuracy = results.get('accuracy', 0)
            status = "✓" if accuracy == 100 else f"✗ {results.get('failed', 0)} failed"
            console.print(f"  → {accuracy:.1f}% accuracy {status}\n")

        except Exception as e:
            console.print(f"[red]Error running {category}: {e}[/red]\n")

    # Run all attack types
    attack_types = ['multi-turn', 'prompt-injection', 'over-refusal']
    console.print(f"\n[bold]Running {len(attack_types)} attack types...[/bold]\n")

    for i, attack_type in enumerate(attack_types, 1):
        console.print(f"[cyan]({i}/{len(attack_types)})[/cyan] Testing attack: {attack_type}")
        try:
            log_file = create_log_file(attack_type.replace('-', '_'), "")
            debug_log_file = log_file.with_suffix('.debug.jsonl')

            if attack_type == 'multi-turn':
                conversations = load_multi_turn_tests()
                results = test_multi_turn(
                    conversations=conversations,
                    client=client,
                    model_name=model,
                    log_file=log_file,
                    debug_log_file=debug_log_file,
                    show_full_content=show_full
                )
            elif attack_type == 'prompt-injection':
                tests = load_injection_tests()
                results = test_prompt_injection(
                    tests=tests,
                    client=client,
                    model_name=model,
                    log_file=log_file,
                    debug_log_file=debug_log_file,
                    show_full_content=show_full
                )
            else:  # over-refusal
                tests = load_overrefusal_tests()
                results = test_over_refusal(
                    tests=tests,
                    client=client,
                    model_name=model,
                    log_file=log_file,
                    debug_log_file=debug_log_file,
                    show_full_content=show_full
                )

            all_results['attacks'].append({
                'attack_type': attack_type,
                'results': results
            })

            total_cost += results.get('cost', 0)

            # Show quick summary based on attack type
            if attack_type == 'multi-turn':
                asr = results.get('asr', 0)
                status = "✓ Defended" if asr == 0 else f"✗ {results.get('attacks_succeeded', 0)} succeeded"
                console.print(f"  → {asr:.1f}% ASR {status}\n")
                total_tests += results.get('total_turns', 0)
            else:
                metric = results.get('asr', results.get('false_positive_rate', 0))
                total = results.get('total_tests', 0)
                status = "✓ All blocked" if metric == 0 else f"✗ {metric:.1f}% rate"
                console.print(f"  → {status}\n")
                total_tests += total

        except Exception as e:
            console.print(f"[red]Error running {attack_type}: {e}[/red]\n")

    # Display comprehensive summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    console.print(Panel(
        f"[bold]Comprehensive Test Suite Results[/bold]\n\n"
        f"[cyan]Baseline Categories:[/cyan] {len(categories)} categories tested\n"
        f"  Total Tests: {total_tests}\n"
        f"  Passed: [green]{total_passed}[/green]\n"
        f"  Failed: [red]{total_failed}[/red]\n"
        f"  Accuracy: [cyan]{(total_passed/total_tests*100) if total_tests > 0 else 0:.1f}%[/cyan]\n\n"
        f"[cyan]Attack Types:[/cyan] {len(attack_types)} attack types tested\n\n"
        f"[cyan]Overall:[/cyan]\n"
        f"  Total Cost: [yellow]${total_cost:.4f}[/yellow]\n"
        f"  Duration: {duration:.1f}s\n",
        border_style="green" if total_failed == 0 else "yellow",
        title="🎯 All Tests Complete"
    ))

    # Show per-category breakdown
    console.print("\n[bold]Baseline Category Results:[/bold]")
    table = Table(show_header=True, header_style="bold cyan")
    table.add_column("Category", style="cyan")
    table.add_column("Tests", justify="right")
    table.add_column("Passed", justify="right", style="green")
    table.add_column("Failed", justify="right", style="red")
    table.add_column("Accuracy", justify="right")

    for item in all_results['baseline']:
        r = item['results']
        table.add_row(
            item['category'],
            str(r.get('total_tests', 0)),
            str(r.get('passed', 0)),
            str(r.get('failed', 0)),
            f"{r.get('accuracy', 0):.1f}%"
        )

    console.print(table)

    # Show attack results
    console.print("\n[bold]Attack Type Results:[/bold]")
    attack_table = Table(show_header=True, header_style="bold cyan")
    attack_table.add_column("Attack Type", style="cyan")
    attack_table.add_column("Metric")
    attack_table.add_column("Status")

    for item in all_results['attacks']:
        r = item['results']
        attack_type = item['attack_type']

        if attack_type == 'multi-turn':
            metric = f"{r.get('asr', 0):.1f}% ASR"
            status = "[green]✓ Defended[/green]" if r.get('asr', 0) == 0 else f"[red]✗ {r.get('attacks_succeeded', 0)} attacks succeeded[/red]"
        else:
            rate = r.get('asr', r.get('false_positive_rate', 0))
            metric = f"{rate:.1f}% rate"
            status = "[green]✓ All handled correctly[/green]" if rate == 0 else f"[red]✗ Issues detected[/red]"

        attack_table.add_row(attack_type, metric, status)

    console.print(attack_table)


def _display_results_summary(results):
    """Display formatted test results summary"""
    if results.get('test_type') == 'baseline':
        console.print(Panel(
            f"[bold]Results Summary[/bold]\n\n"
            f"Total Tests: {results['total_tests']}\n"
            f"Passed: [green]{results['passed']}[/green]\n"
            f"Failed: [red]{results['failed']}[/red]\n"
            f"Accuracy: [cyan]{results['accuracy']:.1f}%[/cyan]\n\n"
            f"Avg Quality Score: {results['reasoning_quality']['average']:.1f}/100\n"
            f"Total Cost: ${results['cost']:.4f}\n"
            f"Avg Latency: {results['avg_latency']:.0f}ms",
            border_style="green" if results['accuracy'] == 100 else "yellow"
        ))
    elif results.get('test_type') == 'multi-turn':
        console.print(Panel(
            f"[bold]Multi-Turn Attack Results[/bold]\n\n"
            f"Conversations: {results['total_conversations']}\n"
            f"Total Turns: {results['total_turns']}\n"
            f"Attacks Attempted: {results['attacks_attempted']}\n"
            f"Attacks Succeeded: [{'red' if results['attacks_succeeded'] > 0 else 'green'}]{results['attacks_succeeded']}[/]\n"
            f"Attack Success Rate: [{'red' if results['asr'] > 0 else 'green'}]{results['asr']:.1f}%[/]\n\n"
            f"Total Cost: ${results['cost']:.4f}",
            border_style="green" if results['asr'] == 0 else "red"
        ))
    else:
        # Prompt injection or over-refusal
        asr = results.get('asr', 0)
        fpr = results.get('false_positive_rate', 0)
        metric = asr if 'asr' in results else fpr

        console.print(Panel(
            f"[bold]Attack Test Results[/bold]\n\n"
            f"Total Tests: {results['total_tests']}\n"
            f"Attacks Succeeded: [{'red' if results.get('attacks_succeeded', 0) > 0 else 'green'}]{results.get('attacks_succeeded', 0)}[/]\n"
            f"False Positives: [{'red' if results.get('false_positives', 0) > 0 else 'green'}]{results.get('false_positives', 0)}[/]\n"
            f"Rate: [{'red' if metric > 0 else 'green'}]{metric:.1f}%[/]\n\n"
            f"Total Cost: ${results['cost']:.4f}",
            border_style="green" if metric == 0 else "red"
        ))


def _interactive_baseline_tests():
    """Interactive baseline test selection"""
    categories = list_categories()

    console.print("\n[bold]Select a category:[/bold]")
    for i, cat in enumerate(categories, 1):
        console.print(f"{i}. {cat}")

    choice = Prompt.ask("Category number", choices=[str(i) for i in range(1, len(categories) + 1)])
    category = categories[int(choice) - 1]

    test_cases = load_baseline_tests(category)
    console.print(f"\n[cyan]{len(test_cases)} tests available for {category}[/cyan]")

    run_all = Confirm.ask("Run all tests?", default=True)
    test_number = None if run_all else int(Prompt.ask("Test number"))

    debug = Confirm.ask("Enable debug mode?", default=False)
    show_full = Confirm.ask("Show full content?", default=False)

    client = setup_openai_client()
    _run_baseline_tests(category, client, 'openai/gpt-oss-safeguard-20b', test_number, debug, show_full)


def _interactive_attack_tests():
    """Interactive attack test selection"""
    attacks = ['multi-turn', 'prompt-injection', 'over-refusal']

    console.print("\n[bold]Select attack type:[/bold]")
    for i, attack in enumerate(attacks, 1):
        console.print(f"{i}. {attack}")

    choice = Prompt.ask("Attack type number", choices=["1", "2", "3"])
    attack_type = attacks[int(choice) - 1]

    client = setup_openai_client()
    _run_attack_tests(attack_type, client, 'openai/gpt-oss-safeguard-20b', None, None, False)


def _interactive_list_options():
    """Interactive list options"""
    console.print("\n[bold]What would you like to see?[/bold]")
    console.print("1. Categories")
    console.print("2. Attack Types")

    choice = Prompt.ask("Select option", choices=["1", "2"])

    if choice == "1":
        from click.testing import CliRunner
        runner = CliRunner()
        runner.invoke(categories)
    else:
        from click.testing import CliRunner
        runner = CliRunner()
        runner.invoke(attacks)


def _interactive_view_logs():
    """Interactive log viewer"""
    logs_dir = Path("logs")
    if not logs_dir.exists():
        console.print("[yellow]No logs directory found[/yellow]")
        return

    log_files = sorted(logs_dir.glob("*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)[:10]
    if not log_files:
        console.print("[yellow]No log files found[/yellow]")
        return

    console.print("\n[bold]Recent log files:[/bold]")
    for i, log_file in enumerate(log_files, 1):
        console.print(f"{i}. {log_file.name}")

    choice = Prompt.ask("Select log file", choices=[str(i) for i in range(1, len(log_files) + 1)])
    selected_log = log_files[int(choice) - 1]

    from click.testing import CliRunner
    runner = CliRunner()
    runner.invoke(logs, [str(selected_log)])


if __name__ == "__main__":
    cli()
