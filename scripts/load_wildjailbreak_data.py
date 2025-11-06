#!/usr/bin/env python3
"""
Load WildJailbreak dataset and create new prompt-injection test file.

Creates 100 test cases:
- 80 adversarial_harmful examples (should be INVALID)
- 20 adversarial_benign examples (should be VALID)
"""

import csv
from datasets import load_dataset
from pathlib import Path
import random

def main():
    print("Loading WildJailbreak dataset (eval config)...")
    ds = load_dataset("allenai/wildjailbreak", "eval")
    data = ds['train']  # The eval config has a 'train' split

    print(f"Total examples in dataset: {len(data):,}")

    # Separate by data_type
    harmful = [ex for ex in data if ex['data_type'] == 'adversarial_harmful']
    benign = [ex for ex in data if ex['data_type'] == 'adversarial_benign']

    print(f"\nAvailable examples:")
    print(f"  - adversarial_harmful: {len(harmful):,}")
    print(f"  - adversarial_benign: {len(benign):,}")

    # Sample 80 harmful and 20 benign
    random.seed(42)  # For reproducibility
    sampled_harmful = random.sample(harmful, min(80, len(harmful)))
    sampled_benign = random.sample(benign, min(20, len(benign)))

    print(f"\nSampled:")
    print(f"  - Harmful: {len(sampled_harmful)}")
    print(f"  - Benign: {len(sampled_benign)}")

    # Create test cases
    test_cases = []

    # Add harmful examples
    for idx, ex in enumerate(sampled_harmful, 1):
        test_cases.append({
            'test_id': f'WJ-HARM-{idx:03d}',
            'test_name': f'Adversarial Harmful #{idx}',
            'category': 'prompt-injection',
            'injection_type': 'adversarial-harmful',
            'test_content': ex['adversarial'],
            'expected_classification': 'INVALID',
            'attack_success_if_valid': 'true',
            'notes': f"WildJailbreak adversarial harmful example. Label: {ex.get('label', 'N/A')}"
        })

    # Add benign examples
    for idx, ex in enumerate(sampled_benign, 1):
        test_cases.append({
            'test_id': f'WJ-BENIGN-{idx:03d}',
            'test_name': f'Adversarial Benign #{idx}',
            'category': 'prompt-injection',
            'injection_type': 'adversarial-benign',
            'test_content': ex['adversarial'],
            'expected_classification': 'VALID',
            'attack_success_if_valid': 'false',
            'notes': f"WildJailbreak adversarial benign example (should pass). Label: {ex.get('label', 'N/A')}"
        })

    # Shuffle to mix harmful and benign
    random.shuffle(test_cases)

    # Write to CSV
    output_path = Path('datasets/prompt-injection/tests.csv')

    print(f"\nWriting {len(test_cases)} test cases to {output_path}...")

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['test_id', 'test_name', 'category', 'injection_type',
                     'test_content', 'expected_classification', 'attack_success_if_valid', 'notes']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(test_cases)

    print(f"✓ Successfully created {len(test_cases)} test cases")
    print(f"\nBreakdown:")
    print(f"  - INVALID (harmful): {len([t for t in test_cases if t['expected_classification'] == 'INVALID'])}")
    print(f"  - VALID (benign): {len([t for t in test_cases if t['expected_classification'] == 'VALID'])}")

    # Generate summary stats
    print(f"\nBackup saved at: datasets/prompt-injection/tests.csv.backup")
    print(f"New tests at: {output_path}")

    # Show sample harmful
    print("\n" + "="*80)
    print("SAMPLE HARMFUL EXAMPLE:")
    print("="*80)
    harmful_sample = [t for t in test_cases if t['expected_classification'] == 'INVALID'][0]
    print(f"ID: {harmful_sample['test_id']}")
    print(f"Content: {harmful_sample['test_content'][:200]}...")
    print(f"Expected: {harmful_sample['expected_classification']}")

    # Show sample benign
    print("\n" + "="*80)
    print("SAMPLE BENIGN EXAMPLE:")
    print("="*80)
    benign_sample = [t for t in test_cases if t['expected_classification'] == 'VALID'][0]
    print(f"ID: {benign_sample['test_id']}")
    print(f"Content: {benign_sample['test_content'][:200]}...")
    print(f"Expected: {benign_sample['expected_classification']}")

    print("\n✓ Ready to run tests with: uv run python test_safeguard.py --attack-type prompt-injection")

if __name__ == '__main__':
    main()
