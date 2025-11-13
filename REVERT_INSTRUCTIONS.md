# How to Revert the postMessage Changes

If the postMessage iframe communication causes issues, here's how to revert:

## Quick Revert (Recommended)
Simply change the share URL generation back to Vercel:

### In HarmonyWheel.tsx, line ~6486-6493
**Change FROM:**
```typescript
if (isInIframe) {
  // We're in an iframe - use beatkitchen.io URL
  targetOrigin = 'https://beatkitchen.io';
  targetPath = '/harmony';
  console.log('📤 Detected iframe - using beatkitchen.io URL');
} else {
  console.log('📤 Not in iframe - using current URL:', targetOrigin + targetPath);
}
```

**Change TO:**
```typescript
// REVERTED: Always use current URL (Vercel)
console.log('📤 Using current URL:', targetOrigin + targetPath);
```

This makes shares point to Vercel again (takes users off your site, but works immediately).

## Full Revert (Remove All Changes)
If you want to remove all the postMessage code:

### 1. Remove postMessage listener (lines ~528-563)
Delete the entire `useEffect` block that starts with:
```typescript
// ✅ Listen for song parameter from parent page (iframe communication)
useEffect(() => {
  const isInIframe = window.parent && window.parent !== window;
  ...
}, []);
```

### 2. Revert share URL generation (lines ~6479-6493)
Replace with original simple version:
```typescript
const targetOrigin = window.location.origin;
const targetPath = window.location.pathname.replace(/\/$/, '');
```

### 3. Delete files
- `iframe-parent-script.js`
- `INSTRUCTIONS_FOR_PAUL.md`
- This file (`REVERT_INSTRUCTIONS.md`)

## Git Revert
If you committed the changes and want to undo:
```bash
git log --oneline  # Find the commit hash
git revert <commit-hash>  # Creates a new commit that undoes the changes
```

Or to go back to before the changes:
```bash
git reset --hard <commit-before-changes>
```

## What Breaks If You Revert?
- **Nothing!** The app works fine without these changes
- Shared links will point to Vercel instead of beatkitchen.io
- That's the only difference
