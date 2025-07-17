#!/usr/bin/env python3
"""
Summary script to show statistics of the generated topical vocabulary files.
"""

import os
import json
from pathlib import Path

def main():
    """Generate summary statistics of the vocabulary files."""
    base_dir = Path('data/word_lists')
    
    print("🎯 Topical Vocabulary Generation Summary")
    print("=" * 50)
    
    total_files = 0
    total_words = 0
    
    languages = ['spanish', 'english', 'russian']
    levels = ['b1', 'b2']
    
    for lang in languages:
        print(f"\n📚 {lang.upper()} Language Files:")
        lang_total = 0
        
        for level in levels:
            level_dir = base_dir / lang / level
            if level_dir.exists():
                # Count JSON files (excluding index.json)
                json_files = [f for f in level_dir.glob('*.json') if f.name != 'index.json']
                level_words = 0
                
                for json_file in json_files:
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            words_count = len(data.get('words', []))
                            level_words += words_count
                    except Exception as e:
                        print(f"   Error reading {json_file}: {e}")
                
                print(f"   {level.upper()}: {len(json_files)} topics, {level_words} words")
                lang_total += level_words
                total_files += len(json_files)
        
        print(f"   Total for {lang}: {lang_total} words")
        total_words += lang_total
    
    print(f"\n🎉 OVERALL SUMMARY:")
    print(f"   Total JSON files: {total_files}")
    print(f"   Total vocabulary entries: {total_words}")
    print(f"   Languages: {len(languages)}")
    print(f"   Levels: {len(levels)}")
    
    # Show available topics
    spanish_b1_dir = base_dir / 'spanish' / 'b1'
    if spanish_b1_dir.exists():
        try:
            with open(spanish_b1_dir / 'index.json', 'r', encoding='utf-8') as f:
                topics = json.load(f)
            print(f"\n📋 Available Topics ({len(topics)}):")
            for i, topic in enumerate(topics, 1):
                display_name = topic.replace('_', ' ').title()
                print(f"   {i:2d}. {display_name}")
        except Exception as e:
            print(f"Error reading topics: {e}")
    
    print(f"\n✅ All vocabulary files are ready for use in your PWA!")

if __name__ == '__main__':
    main()
