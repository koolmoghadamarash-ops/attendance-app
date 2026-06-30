# Futsal Coach Pro — Android wrapper

Packages the single-file web app (`../futsal.html`) as an installable Android APK using [Capacitor](https://capacitorjs.com/).

`www/index.html` is a generated copy of `../futsal.html` — never edit it directly. Run `./sync-web.sh` to refresh it after changing the web app.

## Get the APK without installing anything locally

1. On GitHub, open **Actions → Build Futsal Coach Android APK**.
2. Click **Run workflow**, pick this branch, run it.
3. When it finishes, download the `futsal-coach-debug-apk` artifact and install it on an Android phone (enable "install from unknown sources" if prompted).

This is a **debug** build — fine for personal install/testing, not signed for the Play Store.

## Build locally (requires Android Studio / SDK + JDK 17+)

```bash
npm install
./sync-web.sh
npx cap sync android
cd android
./gradlew assembleDebug
# APK at android/app/build/outputs/apk/debug/app-debug.apk
```
