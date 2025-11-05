#!/usr/bin/env python3
"""
Consolidate test datasets: Merge golden_dataset.csv and edge_cases.csv into tests.csv
Adds test_type and tags metadata columns.
"""

import csv
from pathlib import Path
from typing import List, Dict

# Categories to process
CATEGORIES = [
    "spam",
    "hate-speech",
    "violence",
    "sexual-content",
    "self-harm",
    "fraud",
    "illegal-activity"
]

def read_csv(file_path: Path) -> List[Dict]:
    """Read CSV file and return list of rows as dicts."""
    if not file_path.exists():
        return []

    rows = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip empty rows
            if not any(row.values()):
                continue
            rows.append(row)
    return rows

def write_consolidated_csv(category: str, golden_rows: List[Dict], edge_rows: List[Dict]):
    """Write consolidated tests.csv with metadata columns."""
    output_path = Path("datasets") / category / "tests.csv"

    print(f"\n{category}:")
    print(f"  Golden dataset: {len(golden_rows)} tests")
    print(f"  Edge cases: {len(edge_rows)} tests")
    print(f"  Total: {len(golden_rows) + len(edge_rows)} tests")

    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            'test_id',
            'test_name',
            'test_content',
            'gpt-oss-safeguard classification',
            'test_type',
            'tags'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        # Write golden dataset tests
        for row in golden_rows:
            writer.writerow({
                'test_id': row.get('test_id', ''),
                'test_name': row.get('test_name', ''),
                'test_content': row.get('test_content', ''),
                'gpt-oss-safeguard classification': row.get('gpt-oss-safeguard classification', ''),
                'test_type': 'baseline',
                'tags': ''
            })

        # Write edge case tests
        for row in edge_rows:
            # Infer tags from test_name
            test_name = row.get('test_name', '').lower()
            tags = []

            if 'coded' in test_name or 'obfusc' in test_name or 'leetspeak' in test_name:
                tags.append('obfuscation')
            if 'emoji' in test_name or 'symbol' in test_name:
                tags.append('emoji')
            if 'satire' in test_name or 'parody' in test_name:
                tags.append('satire')
            if 'news' in test_name or 'reporting' in test_name:
                tags.append('news')
            if 'educational' in test_name or 'academic' in test_name:
                tags.append('educational')
            if 'medical' in test_name or 'surgical' in test_name:
                tags.append('medical')
            if 'boundary' in test_name or 'borderline' in test_name:
                tags.append('boundary')
            if 'minimal' in test_name:
                tags.append('minimal-content')
            if 'format' in test_name or 'variation' in test_name:
                tags.append('format-variation')

            writer.writerow({
                'test_id': row.get('test_id', ''),
                'test_name': row.get('test_name', ''),
                'test_content': row.get('test_content', ''),
                'gpt-oss-safeguard classification': row.get('gpt-oss-safeguard classification', ''),
                'test_type': 'edge_case',
                'tags': ','.join(tags)
            })

    print(f"  ✓ Created {output_path}")

def consolidate_category(category: str):
    """Consolidate golden and edge datasets for a category."""
    datasets_dir = Path("datasets") / category

    # Read existing datasets
    golden_path = datasets_dir / "golden_dataset.csv"
    edge_path = datasets_dir / "edge_cases.csv"

    golden_rows = read_csv(golden_path)
    edge_rows = read_csv(edge_path)

    if not golden_rows and not edge_rows:
        print(f"\n{category}: No datasets found, skipping")
        return

    # Write consolidated CSV
    write_consolidated_csv(category, golden_rows, edge_rows)

def main():
    """Main consolidation process."""
    print("=" * 80)
    print("DATASET CONSOLIDATION")
    print("=" * 80)
    print("\nMerging golden_dataset.csv + edge_cases.csv → tests.csv")
    print("Adding test_type and tags metadata columns")

    total_golden = 0
    total_edge = 0

    for category in CATEGORIES:
        consolidate_category(category)

        # Count for summary
        golden_path = Path("datasets") / category / "golden_dataset.csv"
        edge_path = Path("datasets") / category / "edge_cases.csv"
        total_golden += len(read_csv(golden_path))
        total_edge += len(read_csv(edge_path))

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total golden tests: {total_golden}")
    print(f"Total edge cases: {total_edge}")
    print(f"Total tests: {total_golden + total_edge}")
    print(f"\nConsolidated into 7 tests.csv files")
    print("\nNext steps:")
    print("  1. Review the generated tests.csv files")
    print("  2. Delete old golden_dataset.csv and edge_cases.csv files if satisfied")
    print("  3. Update test_safeguard.py to use 'tests.csv' as default")

if __name__ == "__main__":
    main()
