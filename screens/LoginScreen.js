import { useContext, useState } from "react";
import AuthContent from "../components/Auth/AuthContent";
import { login } from "../utils/auth";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Alert } from "react-native";
import { AuthContext } from "../store/auth-context";

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authenticate } = useContext(AuthContext);

  async function logInHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const authInfo = await login(email, password);
      authenticate(authInfo);
    } catch (error) {
      Alert.alert(
        "Authentication Failed!",
        "Couldn't log you in. Please check credentials"
      );
    }
    setIsAuthenticating(false);
  }

  if (isAuthenticating) {
    return <LoadingOverlay message={"logging in user..."} />;
  }
  return <AuthContent isLogin onAuthenticate={logInHandler} />;
}

export default LoginScreen;
