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
npm install @logto/rn --save
npm install expo-crypto expo-secure-store expo-web-browser @react-native-async-storage/async-storage
```

The `@logto/rn` package is the SDK for Logto. The remaining packages are its peer dependencies. They couldn't be listed as direct dependencies because the Expo CLI requires that all dependencies for native modules be installed directly within the root project's package.json.

You could also use other package managers such as `yarn` or `pnpm`.

## Configuration

To make the redirect URI deep link work, you need to configure the `scheme` in the `app.json` file.

e.g. In the `@logto/rn-sample` we use `io.logto://callback` as the callback URL.

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

const App = () => {
  const { signIn, signOut, isAuthenticated } = useLogto();

  const logtoConfig = {
    appId: "YOUR_APP",
    endpoint: "YOUR_LOGTO_ENDPOINT",
  };

  return (
    <LogtoProvider config={logtoConfig}>
      {isAuthenticated ? (
        <Button title="Sign Out" onPress={signOut} />
      ) : (
        <Button title="Sign In" onPress={async () => signIn(redirectUri)} />
      )}
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

### Run using Expo Go

> [!Caution]
> This SDK is not compatible with "Expo Go" sandbox on Android.
> Under the hood, this SDK uses `ExpoAuthSession` to handle the user authentication flow. Native deep linking is not supported in "Expo Go". For more details please refer to [deep-linking](https://docs.expo.dev/guides/deep-linking/)
> Use [development-build](https://docs.expo.dev/develop/development-builds/introduction/) to test this SDK on Android.

Under the path `packages/rn-sample` run the following command.

```bash
pnpm dev:ios
```

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
