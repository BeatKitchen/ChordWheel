# Instructions for Paul: Enable Harmony Wheel Song Sharing

## What This Does
Enables users to share songs via URL (e.g., `https://beatkitchen.io/harmony?song=...`). When someone clicks a shared link, the song loads automatically in the Harmony Wheel.

## What You Need to Do
Add ONE script tag to the beatkitchen.io/harmony page (wherever the iframe is embedded).

## Step 1: Add MIDI Permission to iframe
Find the HTML file that contains the Harmony Wheel iframe. It probably looks like:
```html
<iframe src="https://chord-wheel-plum.vercel.app/" ...></iframe>
```

**CRITICAL**: Add `allow="midi"` to the iframe tag to enable MIDI output:
```html
<iframe src="https://chord-wheel-plum.vercel.app/" allow="midi" ...></iframe>
```

Without this, users won't be able to send MIDI from the Harmony Wheel to their DAWs (Logic, Ableton, etc.).

## Step 2: Add the Script
Add this script **BEFORE** the iframe tag:

```html
<script>
  // Enable song sharing for Harmony Wheel iframe
  window.addEventListener('message', function(event) {
    // Security: only accept messages from the Harmony Wheel app
    if (event.origin !== 'https://chord-wheel-plum.vercel.app') {
      return;
    }

    // If iframe requests URL parameters, send them
    if (event.data && event.data.type === 'REQUEST_URL_PARAMS') {
      const urlParams = new URLSearchParams(window.location.search);
      const songParam = urlParams.get('song');

      if (songParam) {
        // Send song parameter to iframe
        event.source.postMessage({
          type: 'PARENT_URL_PARAMS',
          song: songParam
        }, event.origin);
      }
    }
  });
</script>

<iframe src="https://chord-wheel-plum.vercel.app/" ...></iframe>
```

## Complete Example
```html
<!DOCTYPE html>
<html>
<head>
  <title>Harmony Wheel</title>
</head>
<body>
  <h1>Beat Kitchen Harmony Wheel</h1>

  <!-- ADD THIS SCRIPT -->
  <script>
    window.addEventListener('message', function(event) {
      if (event.origin !== 'https://chord-wheel-plum.vercel.app') return;
      if (event.data && event.data.type === 'REQUEST_URL_PARAMS') {
        const urlParams = new URLSearchParams(window.location.search);
        const songParam = urlParams.get('song');
        if (songParam) {
          event.source.postMessage({
            type: 'PARENT_URL_PARAMS',
            song: songParam
          }, event.origin);
        }
      }
    });
  </script>

  <!-- Your existing iframe - MUST include allow="midi" for MIDI output to work -->
  <iframe
    src="https://chord-wheel-plum.vercel.app/"
    allow="midi"
    width="100%"
    height="800"
    frameborder="0"
  ></iframe>
</body>
</html>
```

## Testing
1. Deploy the change to beatkitchen.io
2. In the Harmony Wheel, create a song and click "SHARE"
3. Open the generated link (should be `https://beatkitchen.io/harmony?song=...`)
4. The song should load automatically!

## Troubleshooting

### Song Sharing Not Working
Open browser console (F12) and look for:
- ✅ `📤 Asking parent for URL parameters...` (from iframe)
- ✅ `📨 Received message from iframe` (from parent page)
- ✅ `📤 Sending song parameter to iframe` (from parent page)
- ✅ `🎵 Parent has song parameter` (from iframe)

If you don't see these messages, the script might not be in the right place.

### MIDI Output Not Working
If users can't send MIDI to their DAWs:
1. **Check the iframe has `allow="midi"`** - This is CRITICAL!
2. Open browser console and look for MIDI errors
3. Make sure the user has:
   - Selected their MIDI output device from the dropdown (e.g., "IAC Driver Bus 1")
   - Enabled audio (speaker icon on)
   - MIDI input configured in their DAW (Logic, Ableton, etc.)

## Reverting
To revert, simply remove the `<script>` tag. The app will continue to work normally, but shared links won't load songs.

## Questions?
Contact Nathan with any questions!
