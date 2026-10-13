/**
 * Build-time switches. EXPO_PUBLIC_* values are inlined when the app is built.
 *
 * SHOW_REVIEW_STATUS — shows the "draft · reviewed: false" notes that tell
 * coaches and translators what still needs checking. Off in store builds
 * (they read as unfinished to users and to App Review); on for the web
 * preview, which is the review copy:
 *   EXPO_PUBLIC_SHOW_REVIEW=1 npx expo export -p web
 */
export const SHOW_REVIEW_STATUS = process.env.EXPO_PUBLIC_SHOW_REVIEW === '1';
