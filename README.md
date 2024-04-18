<p align="center">
  <a href="https://logto.io" target="_blank" align="center" alt="Logto Logo">
    <img src="https://github.com/logto-io/logto/raw/master/logo.png" height="100">
  </a>
</p>

# Logto React Native

[![Discord](https://img.shields.io/discord/965845662535147551?logo=discord&logoColor=ffffff&color=7389D8&cacheSeconds=600)](https://discord.gg/UEPaF3j5e6)
[![Build Status](https://github.com/logto-io/react-native/actions/workflows/main.yml/badge.svg)](https://github.com/logto-io/react-native/actions/workflows/main.yml)

The monorepo for Logto React Native (Expo) SDK and sample.

- [@logto/rn](./packages/rn) - Logto React Native SDK
- [@logto/rn-sample](./packages/rn-sample) - Sample app using Logto React Native SDK

## Installation

```bash
npm install @logto/rn
npm install expo-crypto expo-secure-store expo-web-browser @react-native-async-storage/async-storage
```

The `@logto/rn` package is the SDK for Logto. The remaining packages are its peer dependencies. They couldn't be listed as direct dependencies because the Expo CLI requires that all dependencies for native modules be installed directly within the root project's `package.json`.

You could also use other package managers such as `yarn` or `pnpm`.

## Configuration

To make the redirect URI deep link work, you need to configure the `scheme` in the `app.json` file.

For instance, in the `@logto/rn-sample` we use `io.logto://callback` as the callback URL.

```json
{
  "expo": {
    "scheme": "io.logto"
  }
}
```

## Integration

```tsx
import { LogtoProvider, useLogto } from "@logto/rn";

// Use `useLogto()` hook to sign in and sign out
const Content = () => {
  const { signIn, signOut, isAuthenticated } = useLogto();

  return isAuthenticated ? (
    <Button title="Sign Out" onPress={signOut} />
  ) : (
    <Button title="Sign In" onPress={async () => signIn(redirectUri)} />
  );
};

// Wrap your page component with `LogtoProvider`
const App = () => {
  const logtoConfig = {
    appId: "YOUR_APP",
    endpoint: "YOUR_LOGTO_ENDPOINT",
  };

  return (
    <LogtoProvider config={logtoConfig}>
      <Content />
    </LogtoProvider>
  );
};
```

## Run the sample app

### Replace the `appId` and `endpoint` in `App.tsx` with your own Logto settings.

```tsx
const endpoint = "YOUR_LOGTO_ENDPOINT";
const appId = "YOUR_APP_ID";
```

### Development using Expo Go

#### For iOS

Customize the redirect URI e.g. `io.logto://callback` and pass it to the `signIn` function.

Run the following command under the path `packages/rn-sample`.

```bash
pnpm dev:ios
```

#### For web

Customize the redirect URI e.g. `http://localhost:19006` and pass it to the `signIn` function.

Run the following command under the path `packages/rn-sample`.

```bash
pnpm dev:web
```

#### For Android

> [!Caution]
> This SDK is not compatible with "Expo Go" sandbox on Android.
> Expo Go app by default uses `exp://` scheme for deep linking, which is not a valid private native scheme. See [OAuth2 spec](https://datatracker.ietf.org/doc/html/rfc8252#section-8.4) for more details.
> For Android, Use [development-build](https://docs.expo.dev/develop/development-builds/introduction/) to test this SDK

> [!Note]
> In terms of the redirect URI scheme, different platforms have different requirements.
>
> - For native platforms, a Private-Use native URI scheme is required. See [OAuth2 spec](https://datatracker.ietf.org/doc/html/rfc8252#section-8.4) for more details.
> - For web platforms (SPA), an `http(s)//` scheme is required.
>
> You may need to register different applications in the Logto dashboard for different platforms. Make sure to configure the correct `redirectUri` and `clientId` for different platforms.

### Build and run native package

Under the path `packages/rn-sample` run the following command.

```bash
# Run expo
pnpm expo run

# Directly run on android device
# pnpm android

# Directly run on ios device
# pnpm ios
```

## Resources

- [📖 Logto docs](https://docs.logto.io/?utm_source=github&utm_medium=repo_logto)
- [✍️ Blog](https://blog.logto.io/?utm_source=github&utm_medium=repo_logto)
