import { LogtoProvider, Prompt, useLogto, type IdTokenClaims } from '@logto/rn';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

// Replace with your own redirect URI
const redirectUri = 'io.logto://callback';
const endpoint = 'https://<your-logto-endpoint>';
const appId = '<your-app-id>';

const Content = () => {
  const { signIn, signOut, client, isAuthenticated, getIdTokenClaims } = useLogto();
  const [claims, setClaims] = useState<IdTokenClaims>();

  useEffect(() => {
    const get = async () => {
      setClaims(await getIdTokenClaims());
    };

    if (isAuthenticated) {
      void get();
    }
  }, [isAuthenticated, getIdTokenClaims]);

  return (
    <View style={styles.container}>
      <Text style={styles.metadata}>App ID: {client.logtoConfig.appId}</Text>
      {isAuthenticated ? (
        <>
          <Text style={styles.title}>Authenticated</Text>
          {claims &&
            Object.entries(claims).map(([key, value]) => (
              <Text key={key}>
                {key}: {String(value)}
              </Text>
            ))}
          <Button title="Sign out" onPress={async () => signOut()} />
        </>
      ) : (
        <Button title="Sign in" onPress={async () => signIn(redirectUri)} />
      )}
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="auto" />
    </View>
  );
};

const App = () => {
  return (
    <LogtoProvider
      config={{
        endpoint,
        appId,
        // For better demonstration, override the default prompt to always show the login screen.
        // Default value is `Prompt.Consent`.
        // With `Prompt.Consent` settings, user will automatically be consented if they have a valid session.
        prompt: Prompt.Login,
      }}
    >
      <Content />
    </LogtoProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
  },
  metadata: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
    color: '#666',
  },
});
