import { useContext, useState } from "react";
import AuthContent from "../components/Auth/AuthContent";
import { createUser } from "../utils/auth";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import { Alert } from "react-native";
import { AuthContext } from "../store/auth-context";

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authenticate } = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      const authInfo = await createUser(email, password);
      authenticate(authInfo);
    } catch (error) {
      Alert.alert(
        "Authentication Failed!",
        "Couldn't register you. Please check input details or try again later"
      );
    }
    setIsAuthenticating(false);
  }

  if (isAuthenticating) {
    return <LoadingOverlay message={"Creating user..."} />;
  }
  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
