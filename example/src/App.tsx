import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import oAuth from 'o-auth';
import type { IAuth } from 'src/types';

export default function App() {
  const [result, setResult] = React.useState<IAuth>();

  React.useEffect(() => {
    setResult(
      oAuth({
        signInUrl: 'http://localhost/auth',
        signOutUrl: 'http://localhost/logout',
        refreshTokenUrl: 'http://localhost/auth/token/refresh',
        getUserUrl: 'http://localhost/user',
      })
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
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
