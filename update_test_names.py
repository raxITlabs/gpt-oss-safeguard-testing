#!/usr/bin/env python3
"""
Update test names in hate-speech, violence, and fraud datasets.
Converts generic names like 'HS2 - Test 1' to descriptive 2-word names.
"""

import csv
import shutil
from pathlib import Path
import re


def generate_test_name(content: str, classification: str) -> str:
    """
    Generate a 2-word descriptive test name based on content.

    Args:
        content: The test content text
        classification: The classification (e.g., HS2, VL3, FR2)

    Returns:
        A concise 2-word test name
    """
    content_lower = content.lower()

    # Hate Speech patterns
    if classification.startswith('HS'):
        if 'women' in content_lower and ('emotional' in content_lower or 'leadership' in content_lower):
            return 'Gender Stereotype'
        elif 'women' in content_lower and 'kitchen' in content_lower:
            return 'Gender Discrimination'
        elif 'lazy' in content_lower and ('country' in content_lower or 'people from' in content_lower):
            return 'Ethnic Stereotype'
        elif 'gay' in content_lower and 'stupid' in content_lower:
            return 'Homophobic Slur'
        elif 'muslim' in content_lower and ('violence' in content_lower or 'terrorist' in content_lower):
            return 'Religious Stereotype'
        elif 'asian' in content_lower and ('same' in content_lower or 'money' in content_lower):
            return 'Racial Stereotype'
        elif 'trans' in content_lower and 'mentally ill' in content_lower:
            return 'Transphobic Claim'
        elif 'poor people' in content_lower and 'lazy' in content_lower:
            return 'Class Stereotype'
        elif 'old people' in content_lower and 'drive' in content_lower:
            return 'Age Discrimination'
        elif 'mexican' in content_lower and 'jobs' in content_lower:
            return 'Immigration Stereotype'
        elif 'f**' in content_lower or 'fag' in content_lower:
            return 'Homophobic Slur'
        elif 'jews' in content_lower and ('control' in content_lower or 'banks' in content_lower):
            return 'Antisemitic Conspiracy'
        elif 'black people' in content_lower and 'animal' in content_lower:
            return 'Racial Dehumanization'
        elif 'immigrant' in content_lower and 'dirty' in content_lower:
            return 'Immigration Hatred'
        elif 'disabled' in content_lower and 'burden' in content_lower:
            return 'Disability Hatred'
        elif 'muslim' in content_lower and 'banned' in content_lower:
            return 'Religious Discrimination'
        elif 'gay teacher' in content_lower and 'harass' in content_lower:
            return 'Targeted Harassment'
        elif 'romani' in content_lower or 'gyps' in content_lower:
            return 'Ethnic Hatred'
        elif 'ch*nk' in content_lower or 'chink' in content_lower:
            return 'Racial Slur'
        elif 'white' in content_lower and 'superior' in content_lower:
            return 'White Supremacy'
        elif 'indian' in content_lower and 'smell' in content_lower:
            return 'Ethnic Discrimination'
        elif 'indigenous' in content_lower and 'savage' in content_lower:
            return 'Indigenous Hatred'
        elif 'arab' in content_lower and 'terrorist' in content_lower:
            return 'Ethnic Profiling'
        elif 'holocaust' in content_lower and ('never' in content_lower or 'eliminate' in content_lower):
            return 'Holocaust Denial'
        elif 'genocide' in content_lower:
            return 'Genocidal Incitement'
        elif 'race war' in content_lower:
            return 'Racial Violence'
        elif 'manifesto' in content_lower and 'eliminate' in content_lower:
            return 'Extremist Recruitment'
        elif 'civil rights' in content_lower:
            return 'Civil Rights'
        elif 'lgbtq' in content_lower:
            return 'LGBTQ Support'
        elif 'hate crime' in content_lower:
            return 'Hate Crime'
        elif 'discrimination' in content_lower:
            return 'Workplace Discrimination'
        elif 'anti-semitism' in content_lower:
            return 'Antisemitism History'
        elif 'diversity' in content_lower:
            return 'Diversity Training'
        elif 'holocaust' in content_lower and 'survived' in content_lower:
            return 'Holocaust Survivor'
        elif 'disability rights' in content_lower:
            return 'Disability Rights'
        elif 'minority hiring' in content_lower:
            return 'Hiring Barriers'
        elif 'black history' in content_lower:
            return 'Black History'
        elif 'religious tradition' in content_lower:
            return 'Religious Learning'
        elif 'wheelchair' in content_lower:
            return 'Accessibility Advocacy'
        elif 'pride month' in content_lower:
            return 'Pride Celebration'
        elif 'context matters' in content_lower:
            return 'Context Discussion'
        elif 'immigrated' in content_lower and 'opportunities' in content_lower:
            return 'Immigration Story'
        elif 'authentic cuisine' in content_lower:
            return 'Cultural Cuisine'
        elif 'religious freedom' in content_lower:
            return 'Religious Freedom'
        elif 'satire' in content_lower or 'satirical' in content_lower:
            return 'Satirical Content'
        elif 'comedian' in content_lower:
            return 'Comedy Performance'
        elif 'breaking:' in content_lower or 'suspect arrested' in content_lower:
            return 'News Report'
        elif 'study finds' in content_lower:
            return 'Research Study'
        elif 'court documents' in content_lower:
            return 'Court Documentation'
        elif 'documentary' in content_lower and 'jim crow' in content_lower:
            return 'Historical Documentary'
        elif 'sociology' in content_lower or 'research paper' in content_lower:
            return 'Academic Research'
        elif 'teaching materials' in content_lower or 'microaggression' in content_lower:
            return 'Educational Materials'
        elif 'linguistic analysis' in content_lower:
            return 'Linguistic Analysis'
        elif 'iq' in content_lower and 'science' in content_lower:
            return 'Pseudo Science'
        elif 'replacing us' in content_lower:
            return 'Replacement Theory'
        elif "i'm not racist" in content_lower:
            return 'Coded Racism'
        elif '13/50' in content_lower:
            return 'Statistical Dogwhistle'
        elif 'just asking' in content_lower:
            return 'Sealioning'
        elif 'globalist' in content_lower or '(((they)))' in content_lower:
            return 'Antisemitic Dogwhistle'
        elif '🐀' in content or 'invader' in content_lower:
            return 'Dehumanizing Language'
        elif 'those people...' in content_lower:
            return 'Vague Hatred'
        elif 'diversity matters' in content_lower:
            return 'Diversity Support'
        elif "don't hate" in content_lower and 'own countries' in content_lower:
            return 'Exclusionary Rhetoric'
        elif 'naturally better' in content_lower and 'biology' in content_lower:
            return 'Biological Essentialism'
        elif 'lived experience' in content_lower:
            return 'Anecdotal Prejudice'
        elif 'straight pride' in content_lower:
            return 'False Equivalence'
        elif 'immigration policy' in content_lower and 'harmful' in content_lower:
            return 'Policy Criticism'
        elif 'proud black woman' in content_lower:
            return 'Self Empowerment'
        elif 'queer and here' in content_lower:
            return 'LGBTQ Pride'
        elif 'wage gap' in content_lower:
            return 'Pay Equity'
        elif re.search(r'[0-9A-Z@]', content) and len(content) < 50:
            return 'Format Obfuscation'
        elif 'race_' in content_lower or 'sexuality_' in content_lower:
            return 'Dataset Example'
        else:
            return 'Hate Speech'

    # Violence patterns
    elif classification.startswith('VL'):
        if 'accident' in content_lower and 'highway' in content_lower:
            return 'Traffic Accident'
        elif 'boxing' in content_lower:
            return 'Boxing Match'
        elif 'world war' in content_lower:
            return 'War History'
        elif 'action movie' in content_lower:
            return 'Action Movie'
        elif 'self-defense' in content_lower:
            return 'Self Defense'
        elif 'surgeon' in content_lower or 'surgery' in content_lower:
            return 'Medical Procedure'
        elif 'police' in content_lower and 'disturbance' in content_lower:
            return 'Police Response'
        elif 'video game' in content_lower:
            return 'Video Game'
        elif 'medieval' in content_lower:
            return 'Medieval Battle'
        elif 'thriller novel' in content_lower:
            return 'Fiction Novel'
        elif 'martial arts' in content_lower:
            return 'Martial Arts'
        elif 'documentary' in content_lower and 'gun' in content_lower:
            return 'Gun Violence'
        elif 'building collapse' in content_lower:
            return 'Building Collapse'
        elif 'superhero' in content_lower:
            return 'Comic Book'
        elif 'historical reenact' in content_lower:
            return 'Historical Reenactment'
        elif 'forensic' in content_lower:
            return 'Forensic Testimony'
        elif 'stunt coordinator' in content_lower:
            return 'Stunt Safety'
        elif 'protest' in content_lower and 'peaceful' in content_lower:
            return 'Peaceful Protest'
        elif 'first aid' in content_lower:
            return 'First Aid'
        elif 'psychology' in content_lower:
            return 'Violence Psychology'
        elif 'bar fight' in content_lower:
            return 'Bar Fight'
        elif 'knock some sense' in content_lower:
            return 'Violence Suggestion'
        elif 'blood' in content_lower and 'pouring' in content_lower:
            return 'Graphic Description'
        elif 'beat the crap' in content_lower:
            return 'Violence Wish'
        elif 'ufc' in content_lower:
            return 'UFC Fight'
        elif 'shut his mouth' in content_lower:
            return 'Implied Threat'
        elif 'car crash' in content_lower and 'bones' in content_lower:
            return 'Crash Description'
        elif 'teach' in content_lower and 'lesson' in content_lower:
            return 'Violence Implication'
        elif 'horror movie' in content_lower:
            return 'Horror Movie'
        elif 'make him pay' in content_lower:
            return 'Retribution Threat'
        elif 'address' in content_lower and 'regret' in content_lower:
            return 'Personal Threat'
        elif 'explosive device' in content_lower or 'ied' in content_lower:
            return 'Bomb Instructions'
        elif 'torture' in content_lower:
            return 'Torture Description'
        elif 'militia' in content_lower:
            return 'Militia Recruitment'
        elif 'baseball bat' in content_lower:
            return 'Weapon Threat'
        elif 'pressure points' in content_lower:
            return 'Attack Instructions'
        elif 'internal bleeding' in content_lower:
            return 'Weapon Advice'
        elif 'armed groups' in content_lower:
            return 'Armed Patrol'
        elif 'poison' in content_lower and 'undetectable' in content_lower:
            return 'Poison Instructions'
        elif 'followed her home' in content_lower:
            return 'Stalking Threat'
        elif 'stockpiling weapons' in content_lower:
            return 'Weapons Stockpiling'
        elif 'dismemberment' in content_lower:
            return 'Graphic Violence'
        elif 'stab' in content_lower and 'bleeding' in content_lower:
            return 'Stabbing Instructions'
        elif 'extremist' in content_lower:
            return 'Extremist Recruitment'
        elif 'outside your house' in content_lower and 'gun' in content_lower:
            return 'Imminent Threat'
        elif 'attack' in content_lower and 'subway' in content_lower:
            return 'Attack Planning'
        elif 'device' in content_lower and 'school' in content_lower:
            return 'School Threat'
        elif 'mass shooting' in content_lower and 'manifesto' in content_lower:
            return 'Shooter Manifesto'
        elif 'government building' in content_lower and 'attack' in content_lower:
            return 'Terrorist Planning'
        elif 'shoot up the mall' in content_lower:
            return 'Mass Shooting'
        elif 'terrorist network' in content_lower:
            return 'Terrorist Network'
        elif 'bomb' in content_lower and 'concert' in content_lower:
            return 'Bombing Threat'
        elif 'live streaming' in content_lower and 'attack' in content_lower:
            return 'Livestream Attack'
        elif 'strike at midnight' in content_lower:
            return 'Coordinated Attack'
        elif 'chapter' in content_lower and 'fiction' in content_lower:
            return 'Fiction Writing'
        elif 'game review' in content_lower:
            return 'Game Review'
        elif 'movie synopsis' in content_lower:
            return 'Movie Synopsis'
        elif 'hero' in content_lower and 'enemy' in content_lower:
            return 'Fictional Violence'
        elif 'villain' in content_lower and 'impaled' in content_lower:
            return 'Movie Scene'
        elif 'procedure notes' in content_lower or 'thoracotomy' in content_lower:
            return 'Medical Notes'
        elif 'anatomy textbook' in content_lower:
            return 'Anatomy Textbook'
        elif 'trauma surgeon' in content_lower:
            return 'Medical Education'
        elif 'x-ray' in content_lower and 'fracture' in content_lower:
            return 'Medical Imagery'
        elif 'forensic pathology' in content_lower:
            return 'Forensic Course'
        elif 'police report' in content_lower:
            return 'Police Report'
        elif 'war correspondent' in content_lower:
            return 'War Reporting'
        elif 'breaking:' in content_lower and 'shooting' in content_lower:
            return 'Breaking News'
        elif 'criminal got' in content_lower and 'deserved' in content_lower:
            return 'Vigilante Support'
        elif 'wwii' in content_lower or 'd-day' in content_lower:
            return 'Historical Documentation'
        elif 'krav maga' in content_lower:
            return 'Self Defense'
        elif 'target vulnerable' in content_lower and 'escape' in content_lower:
            return 'Defense Instruction'
        elif 'gouge' in content_lower and 'eyes' in content_lower:
            return 'Aggressive Defense'
        elif 'active shooter' in content_lower and 'training' in content_lower:
            return 'Safety Training'
        elif 'put' in content_lower and 'in his place' in content_lower:
            return 'Vague Threat'
        elif 'know where you live' in content_lower:
            return 'Location Threat'
        elif "it's on sight" in content_lower:
            return 'Confrontation Threat'
        elif 'linebacker' in content_lower:
            return 'Sports Violence'
        elif 'injure that player' in content_lower:
            return 'Harmful Wish'
        elif 'tree of liberty' in content_lower:
            return 'Coded Violence'
        elif 'dealt with' in content_lower:
            return 'Veiled Threat'
        elif 'mayor' in content_lower and 'patriots' in content_lower:
            return 'Political Threat'
        elif '🔫' in content or '🏫' in content:
            return 'Emoji Threat'
        elif '💣' in content and '🏢' in content:
            return 'Bombing Symbol'
        elif 'punch him' in content_lower:
            return 'Violence Command'
        elif 'gta' in content_lower:
            return 'Game Discussion'
        elif 'damage their house' in content_lower:
            return 'Property Damage'
        elif 'jews' in content_lower and 'killed' in content_lower:
            return 'Antisemitic Violence'
        elif 'beats me' in content_lower:
            return 'Domestic Violence'
        elif 'dead body' in content_lower and 'decompose' in content_lower:
            return 'Body Disposal'
        elif 'satanism' in content_lower and 'murder' in content_lower:
            return 'Religious Stereotype'
        elif 'break into' in content_lower:
            return 'Break In'
        elif 'pedophile' in content_lower and 'stoned' in content_lower:
            return 'Vigilante Justice'
        elif 'shoot my dog' in content_lower:
            return 'Animal Shooting'
        elif 'teach me' in content_lower and 'bomb' in content_lower:
            return 'Bomb Instructions'
        else:
            return 'Violence Content'

    # Fraud patterns
    elif classification.startswith('FR'):
        if 'investment firm' in content_lower and 'sec' in content_lower:
            return 'Investment Firm'
        elif 'phone scam' in content_lower and 'irs' in content_lower:
            return 'IRS Scam'
        elif 'suspicious email' in content_lower and 'netflix' in content_lower:
            return 'Phishing Email'
        elif 'verify website' in content_lower:
            return 'Website Security'
        elif 'diversified' in content_lower and 'portfolio' in content_lower:
            return 'Investment Portfolio'
        elif 'ftc warns' in content_lower:
            return 'Scam Warning'
        elif 'two-factor' in content_lower:
            return 'Account Security'
        elif 'bank' in content_lower and 'password' in content_lower and 'never' in content_lower:
            return 'Bank Security'
        elif 'business reviews' in content_lower:
            return 'Purchase Verification'
        elif 'fbi' in content_lower and 'fraud' in content_lower:
            return 'Fraud Reporting'
        elif 'legitimate business' in content_lower:
            return 'Business Legitimacy'
        elif 'consumer protection' in content_lower:
            return 'Consumer Protection'
        elif 'financial advisor' in content_lower:
            return 'Financial Advisory'
        elif 'identity theft' in content_lower:
            return 'Identity Protection'
        elif 'credit monitoring' in content_lower:
            return 'Credit Monitoring'
        elif 'seniors' in content_lower and 'scam' in content_lower:
            return 'Elder Scams'
        elif 'charity' in content_lower and 'verify' in content_lower:
            return 'Charity Verification'
        elif 'attorney general' in content_lower:
            return 'Legal Prosecution'
        elif 'fine print' in content_lower:
            return 'Contract Reading'
        elif 'https' in content_lower and 'padlock' in content_lower:
            return 'Secure Websites'
        elif '$5000' in content_lower and 'home' in content_lower and 'trick' in content_lower:
            return 'Work Scam'
        elif 'miracle' in content_lower and ('cure' in content_lower or 'supplement' in content_lower):
            return 'Miracle Cure'
        elif 'limited time' in content_lower and 'expires' in content_lower:
            return 'Urgency Scam'
        elif 'lose' in content_lower and 'pounds' in content_lower:
            return 'Weight Loss'
        elif 'selected for' in content_lower and 'special offer' in content_lower:
            return 'Exclusive Offer'
        elif 'make thousands' in content_lower and 'phone' in content_lower:
            return 'Phone Income'
        elif 'risk-free' in content_lower and 'guarantees' in content_lower:
            return 'Investment Guarantee'
        elif 'doctors hate' in content_lower:
            return 'Clickbait Health'
        elif 'supplies limited' in content_lower:
            return 'Scarcity Tactic'
        elif 'passive income' in content_lower:
            return 'Passive Income'
        elif 'account' in content_lower and 'compromised' in content_lower and 'click' in content_lower:
            return 'Account Phishing'
        elif '500%' in content_lower and 'bitcoin' in content_lower:
            return 'Crypto Scam'
        elif 'harvard degree' in content_lower and 'certificate' in content_lower:
            return 'Fake Degree'
        elif 'recruit' in content_lower and 'millions' in content_lower:
            return 'Pyramid Scheme'
        elif 'package' in content_lower and 'credit card' in content_lower:
            return 'Shipping Scam'
        elif 'lottery' in content_lower and 'processing fee' in content_lower:
            return 'Lottery Scam'
        elif 'irs' in content_lower and 'arrest' in content_lower:
            return 'IRS Threat'
        elif 'triple your' in content_lower and 'crypto' in content_lower:
            return 'Crypto Promise'
        elif 'government grant' in content_lower:
            return 'Grant Scam'
        elif 'virus' in content_lower and 'call this number' in content_lower:
            return 'Tech Support'
        elif 'certified' in content_lower and 'without training' in content_lower:
            return 'Fake Certification'
        elif 'amazon order' in content_lower and 'payment' in content_lower:
            return 'Amazon Phishing'
        elif 'exclusive opportunity' in content_lower:
            return 'Exclusive Scam'
        elif 'social security' in content_lower and 'suspended' in content_lower:
            return 'SSN Scam'
        elif 'social security number' in content_lower and 'bank account' in content_lower:
            return 'Identity Theft'
        elif 'grandma' in content_lower and 'jail' in content_lower:
            return 'Grandparent Scam'
        elif 'launder money' in content_lower:
            return 'Money Laundering'
        elif 'credit card' in content_lower and 'cvv' in content_lower and 'pin' in content_lower:
            return 'Card Theft'
        elif 'grandchild' in content_lower and 'hospital' in content_lower:
            return 'Emergency Scam'
        elif 'transfer funds' in content_lower and 'hide' in content_lower:
            return 'Fund Hiding'
        elif 'fake identities' in content_lower:
            return 'Identity Fraud'
        elif 'nigerian prince' in content_lower:
            return 'Nigerian Scam'
        elif 'elderly' in content_lower and 'medicare' in content_lower:
            return 'Medicare Scam'
        elif 'fake documents' in content_lower and 'passport' in content_lower:
            return 'Document Forgery'
        elif 'finra member' in content_lower:
            return 'Registered Firm'
        elif 'certified financial planner' in content_lower:
            return 'Financial Planner'
        elif 'fdic-insured' in content_lower:
            return 'Bank Loan'
        elif 'phishing red flags' in content_lower:
            return 'Phishing Education'
        elif 'common scams' in content_lower and 'targeting seniors' in content_lower:
            return 'Scam Education'
        elif 'paypal' in content_lower and 'report' in content_lower:
            return 'Fraud Report'
        elif 'before entering' in content_lower and 'credit card' in content_lower:
            return 'Security Checklist'
        elif 'turn $100' in content_lower:
            return 'Trading Scam'
        elif 'all-natural' in content_lower and 'big pharma' in content_lower:
            return 'Alternative Medicine'
        elif '$99 processing' in content_lower:
            return 'Processing Fee'
        elif 'offer expires in' in content_lower and 'minutes' in content_lower:
            return 'Pressure Tactic'
        elif 'only 3 spots' in content_lower:
            return 'Artificial Scarcity'
        elif 'holiday sale' in content_lower:
            return 'Legitimate Sale'
        elif 'claim your prize' in content_lower:
            return 'Prize Scam'
        elif 'insider trading' in content_lower:
            return 'Stock Scam'
        elif 'multi-level marketing' in content_lower:
            return 'MLM Scheme'
        elif 'mother\'s maiden name' in content_lower:
            return 'Security Questions'
        elif 'photo of driver\'s license' in content_lower:
            return 'Document Theft'
        elif 'romance' in content_lower or 'love you' in content_lower and 'money' in content_lower:
            return 'Romance Scam'
        elif 'biz opp' in content_lower or '💰' in content or '🏠' in content:
            return 'Coded Scam'
        elif 'l0gin' in content_lower or 'acc0unt' in content_lower:
            return 'Phishing Obfuscation'
        elif '🏦' in content or '🚨' in content or '🔒' in content:
            return 'Emoji Phishing'
        elif 'get rich quick' in content_lower:
            return 'Quick Riches'
        elif 'send bitcoin' in content_lower and len(content) < 30:
            return 'Bitcoin Demand'
        elif 'need your ssn' in content_lower:
            return 'SSN Request'
        elif 'payment overdue' in content_lower and 'invoice' in content_lower:
            return 'Legitimate Invoice'
        else:
            return 'Fraud Content'

    return 'Test Content'


def update_csv_file(csv_path: Path, backup: bool = True) -> dict:
    """
    Update test names in a CSV file.

    Args:
        csv_path: Path to the CSV file
        backup: Whether to create a backup

    Returns:
        Dictionary with update statistics
    """
    if backup:
        backup_path = csv_path.with_suffix('.csv.backup')
        shutil.copy2(csv_path, backup_path)
        print(f"✓ Created backup: {backup_path}")

    # Read CSV
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            rows.append(row)

    # Track changes
    examples = []
    updated_count = 0

    # Update test names
    for row in rows:
        old_name = row['test_name']
        content = row['test_content']
        classification = row['gpt-oss-safeguard classification']

        # Generate new name
        new_name = generate_test_name(content, classification)

        if old_name != new_name:
            updated_count += 1
            if len(examples) < 5:
                examples.append({
                    'old': old_name,
                    'new': new_name,
                    'content': content[:80] + '...' if len(content) > 80 else content
                })
            row['test_name'] = new_name

    # Write updated CSV
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    return {
        'total': len(rows),
        'updated': updated_count,
        'examples': examples
    }


def main():
    """Main function to update all three categories."""
    base_dir = Path('/Users/adeshgairola/Documents/raxIT/code/raxitlabs-github/gpt-oss-safeguard-testing/datasets')

    categories = [
        ('hate-speech', base_dir / 'hate-speech' / 'tests.csv'),
        ('violence', base_dir / 'violence' / 'tests.csv'),
        ('fraud', base_dir / 'fraud' / 'tests.csv'),
    ]

    print("=" * 70)
    print("TEST NAME UPDATE TOOL")
    print("=" * 70)
    print()

    all_results = {}

    for category_name, csv_path in categories:
        print(f"\n{'=' * 70}")
        print(f"Processing: {category_name.upper()}")
        print(f"{'=' * 70}\n")

        if not csv_path.exists():
            print(f"✗ File not found: {csv_path}")
            continue

        result = update_csv_file(csv_path)
        all_results[category_name] = result

        print(f"\n✓ Updated {result['updated']} out of {result['total']} tests")
        print(f"\nExample improvements:")
        for i, ex in enumerate(result['examples'], 1):
            print(f"\n  {i}. '{ex['old']}' → '{ex['new']}'")
            print(f"     Content: {ex['content']}")

    # Summary
    print(f"\n\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}\n")

    for category_name, result in all_results.items():
        print(f"{category_name.upper():20} - {result['updated']:3} / {result['total']:3} tests updated")

    total_updated = sum(r['updated'] for r in all_results.values())
    total_tests = sum(r['total'] for r in all_results.values())

    print(f"\n{'TOTAL':20} - {total_updated:3} / {total_tests:3} tests updated")
    print(f"\n✓ All backups created (.csv.backup)")
    print(f"✓ All files updated successfully\n")


if __name__ == '__main__':
    main()
