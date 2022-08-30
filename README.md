# @logto/react-native

Logto React Native SDK (WIP)

Note (Aug 30):

This SDK development is currently putting on hold, as we have encountered an [unexpected issue](https://github.com/ianstormtaylor/superstruct/issues/1085) from `superstruct` when integrating our `@logto/client` SDK. We use `superstruct` as the type guard in our JS core SDKs and thus a new release is expected from them before we can proceed.

The current work (half done) can be found in `charles-log-3909-react-native-sdk` branch, and our plan is to build from our existing JS core SDKs (`@logto/client`) and implement the PKCE navigation by using webview and native browsers.

Alternatively, we might consider another way around this, by creating bridges and calling our iOS and Android SDKs directly from JavaScript code. However, we have limited experience in this field and think it would need much more effort.

We'll continue the development once this blocker issue is resolved. Also, anyone who is interested in React Native development can take a look and and any help would be appreciated.

## Installation

```bash
npm install @logto/react-native
```

## Usage

TBD

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
