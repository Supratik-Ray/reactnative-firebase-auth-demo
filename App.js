import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { Colors } from "./constants/styles";
import { AuthContext, AuthProvider } from "./store/auth-context";
import { useContext } from "react";
import IconButton from "./components/ui/IconButton";

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const { logout } = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary500 },
        headerTintColor: "white",
        contentStyle: { backgroundColor: Colors.primary100 },
        headerRight: ({ tintColor }) => (
          <IconButton
            icon={"exit"}
            color={tintColor}
            size={24}
            onPress={logout}
          />
        ),
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function Root() {
  const { authenticate, regenerateToken } = useContext(AuthContext);
  const [fetchingToken, setFetchingToken] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const storedValue = await AsyncStorage.getItem("authData");
        const authData = JSON.parse(storedValue);

        //if authData doesnt exist
        if (!authData) return;

        //if exists but expired
        if (authData.expiryTime - 60000 < Date.now()) {
          await regenerateToken(authData.refreshToken);
        }
        //if token exists but not expired
        else {
          authenticate({
            token: authData.token,
            refreshToken: authData.refreshToken,
            expiresIn: (authData.expiryTime - Date.now()) / 1000,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setFetchingToken(false);
        SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  if (fetchingToken) return null;
  return <Navigation />;
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </>
  );
}
