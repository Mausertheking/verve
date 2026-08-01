import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only HTML shell. Has no effect on iOS or Android.
 *
 * Without the height rules the React root collapses to its content height and
 * the tab bar floats mid-page instead of sitting at the bottom of the window.
 * `backgroundColor` is set here too so the page behind the app is the app's own
 * background rather than white — otherwise overscroll flashes white on a dark UI.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="az">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: shell }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const shell = `
html, body, #root {
  height: 100%;
  background-color: #0B0E14;
}
body {
  overscroll-behavior: none;
}
`;
