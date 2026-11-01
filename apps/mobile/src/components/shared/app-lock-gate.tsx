// import { useAppLock } from '@/hooks/auth';
// import { Lock } from 'lucide-react-native';
// import { StyleSheet, View } from 'react-native';
// import { Button, Typo } from '../ui';

// export const AppLockGate = ({ children }: { children: React.ReactNode }) => {
//   const { isAppLocked, isVeiled, unlock, biometricLabel } = useAppLock();

//   return (
//     <View className="flex-1">
//       {children}

//       {isVeiled || isAppLocked ? (
//         <View
//           style={StyleSheet.absoluteFill}
//           className="items-center justify-center bg-kalya-primary-dark px-8"
//         >
//           <Lock size={40} color="#d4af37" />
//           {isAppLocked ? (
//             <>
//               <Typo variant="title-lg" className="mt-5 text-center text-white font-outfit-bold">
//                 Kalya is locked
//               </Typo>
//               <Typo variant="body-md" className="mt-2 text-center text-kalya-mint">
//                 Verify identity to view your finances.
//               </Typo>
//               <View className="mt-8 w-full">
//                 <Button
//                   title={`Unlock with ${biometricLabel}`}
//                   variant="gold"
//                   size="lg"
//                   fullWidth
//                   onPress={() => void unlock()}
//                 />
//               </View>
//             </>
//           ) : null}
//         </View>
//       ) : null}
//     </View>
//   );
// };

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useAppLock, useAuth } from '@/hooks/auth';
import { useAuthStore } from '@/stores/auth';
import { Button, Typo } from '../ui';

export const AppLockGate = ({ children }: { children: ReactNode }) => {
  const { isAppLocked, isVeiled, unlock, biometricLabel } = useAppLock();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // Clear the lock so the next sign-in doesn't start locked.
    // Stack.Protected redirects to (auth) automatically, so no router.replace is needed.
    useAuthStore.getState().unlockApp();
  };

  const showOverlay = isVeiled || isAppLocked;

  return (
    <View className="flex-1">
      {children}

      {showOverlay ? (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}
          className="items-center justify-center bg-kalya-primary-dark px-8"
        >
          <Lock size={40} color="#d4af37" />

          {isAppLocked ? (
            <>
              <Typo variant="title-lg" className="mt-5 text-center text-white font-outfit-bold">
                Kalya is locked
              </Typo>
              <Typo variant="body-md" className="mt-2 text-center text-kalya-mint">
                Verify your identity to view your finances.
              </Typo>

              <View className="mt-8 w-full gap-3">
                <Button
                  title={`Unlock with ${biometricLabel}`}
                  variant="gold"
                  size="lg"
                  fullWidth
                  onPress={() => void unlock()}
                />
                <Button
                  title="Log Out & Switch Account"
                  variant="ghost"
                  fullWidth
                  onPress={() => void handleSignOut()}
                />
              </View>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
