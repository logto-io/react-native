import '@logto/rn/polyfill';

import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { LogtoProvider, useLogto } from '@logto/rn';
import { useEffect } from 'react';

const redirectUri = 'io.logto://callback';

function Content() {
  const { signIn, signOut, client, isAuthenticated, getRefreshToken } = useLogto();

  useEffect(() => {
    const get = async () => {
      const token = await getRefreshToken();
      console.log('refresh', token);
    };

    if (isAuthenticated) {
      get();
    }
  }, [isAuthenticated, getRefreshToken]);

  return (
    <View style={styles.container}>
      <Text>{client.logtoConfig.appId}</Text>
      {
        isAuthenticated ? (
          <Button title="Sign out" onPress={() => signOut()} />
        ) : (
          <Button title="Sign in" onPress={() => signIn(redirectUri)} />
        )
      }
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {


  return (
    <LogtoProvider config={{
      endpoint: 'http://localhost:3002/',
      appId: 's5sc0ktp6fs0a8rwqod6h',
    }}>
      <Content />
      </LogtoProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
