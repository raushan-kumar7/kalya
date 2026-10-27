import { Screen, Typo } from '@/components/ui';
import { View } from 'react-native';

const SignIn = () => {
  return (
    <Screen className="items-center justify-center font-ibm-plex">
      <View>
        <Typo>Sign In</Typo>
      </View>
    </Screen>
  );
};

export default SignIn;
