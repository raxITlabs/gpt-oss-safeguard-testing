#!/usr/bin/env python3
"""
Assess placeholders across all dataset categories.
Shows which categories have placeholders and would benefit from HuggingFace data.
"""

import re
import csv
from pathlib import Path
from collections import defaultdict

def find_placeholders(text):
    """Find all [placeholder] patterns in text."""
    return re.findall(r'\[([^\]]+)\]', text)

def assess_category(category_path):
    """Assess placeholders in a category."""
    results = {
        'total_placeholders': 0,
        'unique_placeholders': set(),
        'files': {},
        'examples': []
    }

    # Check all CSV files in the category
    for csv_file in category_path.glob('*.csv'):
        if csv_file.name.endswith('.backup'):
            continue

        file_placeholders = []
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Check all fields for placeholders
                    for field, value in row.items():
                        if value:
                            placeholders = find_placeholders(value)
                            if placeholders:
                                file_placeholders.extend(placeholders)
                                results['unique_placeholders'].update(placeholders)
                                # Save first example
                                if len(results['examples']) < 3:
                                    results['examples'].append({
                                        'file': csv_file.name,
                                        'field': field,
                                        'text': value[:150] + '...' if len(value) > 150 else value,
                                        'placeholders': placeholders
                                    })
        except Exception as e:
            print(f"Error reading {csv_file}: {e}")
            continue

        if file_placeholders:
            results['files'][csv_file.name] = len(file_placeholders)
            results['total_placeholders'] += len(file_placeholders)

    return results

def main():
    datasets_dir = Path('datasets')

    print("="*80)
    print("PLACEHOLDER ASSESSMENT ACROSS ALL DATASETS")
    print("="*80)
    print()

    categories_with_placeholders = {}
    categories_without_placeholders = []

    for category_dir in sorted(datasets_dir.iterdir()):
        if not category_dir.is_dir():
            continue

        category = category_dir.name
        results = assess_category(category_dir)

        if results['total_placeholders'] > 0:
            categories_with_placeholders[category] = results
        else:
            categories_without_placeholders.append(category)

    # Print summary
    print(f"Categories WITH placeholders: {len(categories_with_placeholders)}")
    print(f"Categories WITHOUT placeholders: {len(categories_without_placeholders)}")
    print()

    # Detailed breakdown for categories with placeholders
    if categories_with_placeholders:
        print("="*80)
        print("CATEGORIES WITH PLACEHOLDERS (Sorted by count)")
        print("="*80)
        print()

        # Sort by placeholder count
        sorted_categories = sorted(
            categories_with_placeholders.items(),
            key=lambda x: x[1]['total_placeholders'],
            reverse=True
        )

        for category, results in sorted_categories:
            print(f"📁 {category.upper()}")
            print(f"   Total placeholders: {results['total_placeholders']}")
            print(f"   Unique placeholders: {len(results['unique_placeholders'])}")
            print(f"   Files affected: {len(results['files'])}")

            # Show files
            for filename, count in results['files'].items():
                print(f"      - {filename}: {count} placeholders")

            # Show unique placeholder types
            print(f"   Placeholder types:")
            for placeholder in sorted(results['unique_placeholders'])[:10]:
                print(f"      - [{placeholder}]")
            if len(results['unique_placeholders']) > 10:
                print(f"      ... and {len(results['unique_placeholders']) - 10} more")

            # Show examples
            if results['examples']:
                print(f"   Examples:")
                for ex in results['examples'][:2]:
                    print(f"      File: {ex['file']}")
                    print(f"      Text: {ex['text']}")
                    print(f"      Placeholders: {ex['placeholders']}")
                    print()

            print()

    # Categories without placeholders
    if categories_without_placeholders:
        print("="*80)
        print("CATEGORIES WITHOUT PLACEHOLDERS (Already complete)")
        print("="*80)
        print()
        for category in categories_without_placeholders:
            print(f"   ✓ {category}")
        print()

    # Recommendations
    print("="*80)
    print("RECOMMENDATIONS FOR HUGGINGFACE DATA INTEGRATION")
    print("="*80)
    print()

    if categories_with_placeholders:
        print("Priority order (by placeholder count):")
        print()

        for idx, (category, results) in enumerate(sorted_categories, 1):
            placeholder_count = results['total_placeholders']
            unique_count = len(results['unique_placeholders'])

            # Recommend datasets
            dataset_recommendations = {
                'hate-speech': 'ucberkeley-dlab/measuring-hate-speech (136k examples)',
                'fraud': 'ealvaradob/phishing-dataset (800k+ examples)',
                'multi-turn': 'Anthropic/hh-rlhf (169k examples)',
                'violence': 'nvidia/Aegis-AI-Content-Safety-Dataset-1.0 (11k examples)',
                'self-harm': 'AIMH/SWMH or nvidia/Aegis (sensitive content)',
                'sexual-content': 'ontocord/OIG-moderation (200k, 18+ only)',
                'spam': 'ucirvine/sms_spam (5.5k examples)',
                'illegal-activity': 'Anthropic/hh-rlhf or thu-coai/SafetyBench',
            }

            recommended_dataset = dataset_recommendations.get(category, 'PKU-Alignment/BeaverTails (multi-category)')

            priority = "HIGH" if placeholder_count > 20 else "MEDIUM" if placeholder_count > 5 else "LOW"

            print(f"{idx}. {category.upper()} [{priority} PRIORITY]")
            print(f"   - Placeholders: {placeholder_count} total, {unique_count} unique")
            print(f"   - Recommended dataset: {recommended_dataset}")
            print()
    else:
        print("No placeholders found! All datasets are complete.")

    print("="*80)
    print()

if __name__ == '__main__':
    main()
