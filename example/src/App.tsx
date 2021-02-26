import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import oAuth from 'o-auth';
import type { IAuth, IAuthResult, IUser } from 'src/types';

const baseUrl = 'http://localhost';
const oAuthOptions = {
  signIn: async (email: string, password: string) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        grand_type: 'password',
        email,
        password,
      }),
    });
    const json = await res.json();
    return json as IAuthResult;
  },
  signOut: async (): Promise<void> => {
    await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
    });
  },
  refreshToken: async (refresh_token: string) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        grand_type: 'refresh_token',
        refresh_token,
      }),
    });
    const json = await res.json();
    return json as IAuthResult;
  },
  getUser: async () => {
    const res = await fetch(`${baseUrl}/user`);
    const json = await res.json();
    return json as IUser;
  },
};

export default function App() {
  const [result, setResult] = React.useState<IAuth>();

  React.useEffect(() => {
    setResult(oAuth(oAuthOptions));
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
