#!/bin/bash
sed -i 's/border border-\[var(--outline)\]/border border-transparent/g' src/screens/AppScreens.tsx
sed -i 's/divide-\[var(--outline)\]/divide-[#374151]\/30/g' src/screens/AppScreens.tsx
sed -i 's/border-b border-\[var(--outline)\]/border-b border-[#374151]\/30/g' src/screens/AppScreens.tsx
sed -i 's/hover:bg-\[var(--surface)\]/hover:bg-[#374151]\/50/g' src/screens/AppScreens.tsx
