import React from 'react';

import { StyleSheet, View, Button, Text } from 'react-native';
import { LogtoProvider, useLogto } from '@logto/react-native';

export default function App() {

  const { isAuthenticated, signIn, signOut } = useLogto();

  return (
    <LogtoProvider config={{ appId: 'abc', endpoint: 'https://logto.dev' }}>
      <View style={styles.container}>
        <Text>Logto React Native Sample</Text>
        {isAuthenticated ? 
          <Button title='Sign In' onPress={() => signIn('io.logto://logto/callback')} /> :
          <Button title='Sign Out' onPress={() => signOut()} />}
      </View>
    </LogtoProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
