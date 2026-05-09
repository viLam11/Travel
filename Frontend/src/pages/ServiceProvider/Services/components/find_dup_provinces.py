import re
from collections import Counter

with open('src/constants/provinces.ts', encoding='utf-8') as f:
    content = f.read()

codes = re.findall(r'code:\s*["\']([^"\']+)["\']', content)
dups = [(code, count) for code, count in Counter(codes).items() if count > 1]
print('Duplicate codes:', dups)
print('Total:', len(codes))
