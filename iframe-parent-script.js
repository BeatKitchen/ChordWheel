/**
 * PARENT PAGE SCRIPT for beatkitchen.io/harmony
 *
 * This script enables the iframe to receive URL parameters from the parent page.
 * Add this to the beatkitchen.io/harmony page where the iframe is embedded.
 *
 * Usage:
 * <script src="iframe-parent-script.js"></script>
 * OR just paste this code directly into a <script> tag on the page.
 */

(function() {
  console.log('🔗 Parent page: Setting up iframe communication');

  // Listen for requests from the iframe
  window.addEventListener('message', function(event) {
    // Security: only accept messages from your Vercel app
    if (event.origin !== 'https://chord-wheel-plum.vercel.app') {
      console.log('⚠️ Rejected iframe message from:', event.origin);
      return;
    }

    console.log('📨 Received message from iframe:', event.data);

    // If iframe is requesting URL parameters, send them
    if (event.data && event.data.type === 'REQUEST_URL_PARAMS') {
      const urlParams = new URLSearchParams(window.location.search);
      const songParam = urlParams.get('song');

      if (songParam) {
        console.log('📤 Sending song parameter to iframe:', songParam.substring(0, 50) + '...');

        // Send the parameter back to the iframe
        event.source.postMessage({
          type: 'PARENT_URL_PARAMS',
          song: songParam
        }, event.origin);
      } else {
        console.log('ℹ️ No song parameter in parent URL');
      }
    }
  });

  console.log('✅ Parent page ready to communicate with iframe');
})();
