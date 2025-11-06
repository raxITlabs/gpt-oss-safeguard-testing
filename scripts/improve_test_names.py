#!/usr/bin/env python3
"""
Script to improve test names in baseline category datasets using Claude AI.
Generates descriptive, concise test names from test content.
"""

import anthropic
import csv
import shutil
import os
from pathlib import Path
from typing import List, Dict

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def generate_test_name(content: str, category: str, policy_code: str) -> str:
    """
    Use Claude to generate a descriptive test name from content.

    Args:
        content: The test content
        category: The test category (spam, hate-speech, etc.)
        policy_code: The policy code (SP2, HS3, etc.)

    Returns:
        A concise, descriptive test name (3-8 words)
    """

    # Truncate very long content
    truncated_content = content[:500] if len(content) > 500 else content

    prompt = f"""Based on this test content, generate a concise descriptive name (3-8 words):

Content: "{truncated_content}"
Category: {category}
Policy Code: {policy_code}

Requirements:
- Be specific about the test scenario
- Include key context (e.g., "Phishing", "Stereotype", "Threat", "Instructions")
- Make it searchable and meaningful
- Keep it concise (3-8 words maximum)
- Do NOT include the policy code in the name

Good examples:
- "Bank Account Phishing Email"
- "Gender Leadership Stereotype"
- "Bar Fight Description"
- "Pyramid Scheme Recruitment"
- "Urgent Sale with False Scarcity"

Bad examples:
- "Test 1"
- "SP2 - Test 19"
- "Content about spam"

Generate ONLY the test name, nothing else:"""

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Extract the generated name
        generated_name = message.content[0].text.strip()

        # Remove quotes if present
        generated_name = generated_name.strip('"').strip("'")

        # Limit to reasonable length
        if len(generated_name) > 80:
            generated_name = generated_name[:77] + "..."

        return generated_name

    except Exception as e:
        print(f"  ERROR generating name: {e}")
        # Fallback to a basic name
        return f"{policy_code}: {content[:30]}..."


def improve_category_names(category: str, base_path: Path, dry_run: bool = False):
    """
    Process all tests in a category CSV and improve their test names.

    Args:
        category: Category name (spam, hate-speech, etc.)
        base_path: Base path to the project root
        dry_run: If True, only print what would be changed without modifying files
    """
    csv_path = base_path / "datasets" / category / "tests.csv"
    backup_path = base_path / "datasets" / category / "tests.csv.backup"

    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        return

    print(f"\n{'='*80}")
    print(f"Processing category: {category.upper()}")
    print(f"{'='*80}")

    # Read the CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    print(f"Found {len(rows)} tests to process")

    if not dry_run:
        # Create backup before modifying
        shutil.copy(csv_path, backup_path)
        print(f"✓ Created backup: {backup_path.name}")

    # Process each row
    improved_rows = []
    for idx, row in enumerate(rows, 1):
        content = row.get('content', '')
        policy_code = row.get('policy_code', '')
        old_name = row.get('test_name', '')

        # Skip if content is empty
        if not content:
            print(f"  [{idx}/{len(rows)}] ⚠️  Skipping empty content")
            improved_rows.append(row)
            continue

        # Generate new name
        print(f"  [{idx}/{len(rows)}] Generating name...", end=' ')
        new_name = generate_test_name(content, category, policy_code)
        print(f"✓")

        # Show the change
        if old_name != new_name:
            print(f"    OLD: {old_name}")
            print(f"    NEW: {new_name}")

        # Update the row
        row['test_name'] = new_name
        improved_rows.append(row)

    if not dry_run:
        # Write the improved CSV
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(improved_rows)

        print(f"\n✓ Updated {csv_path.name} with improved test names")
        print(f"✓ Original backed up to {backup_path.name}")
    else:
        print(f"\n🔍 DRY RUN - No files were modified")

    print(f"{'='*80}\n")


def main():
    """Main function to process all categories."""

    # Get the project root (parent of scripts directory)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    print(f"Project root: {project_root}")
    print(f"Using Claude model: claude-3-5-sonnet-20241022")

    # Categories to improve
    categories = [
        "spam",
        "hate-speech",
        "violence",
        "fraud"
    ]

    # Ask user to confirm
    print(f"\nWill process {len(categories)} categories:")
    for cat in categories:
        print(f"  - {cat}")

    response = input("\nProceed? (yes/no): ").lower().strip()

    if response != 'yes':
        print("Aborted.")
        return

    # Process each category
    for category in categories:
        try:
            improve_category_names(category, project_root, dry_run=False)
        except Exception as e:
            print(f"❌ ERROR processing {category}: {e}")
            continue

    print("\n" + "="*80)
    print("✅ ALL CATEGORIES PROCESSED")
    print("="*80)
    print("\nNext steps:")
    print("1. Review the generated names in each CSV file")
    print("2. Run tests to verify names appear correctly in logs")
    print("3. Check UI to confirm improved display")
    print("\nTo rollback, restore from .backup files in each dataset directory")


if __name__ == "__main__":
    main()
