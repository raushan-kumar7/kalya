import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Input, InputProps } from './input';
import { triggerHaptic } from '../primitives/haptic-touchable';

export interface PasswordFieldProps extends Omit<InputProps, 'secureTextEntry' | 'rightIcon'> {
  /**
   * Whether show/hide toggle button is displayed.
   * @default true
   */
  showToggle?: boolean;
}

/**
 * PasswordField provides a secure text field with an eye icon toggle
 * for revealing and concealing sensitive credentials.
 *
 * @param props - PasswordFieldProps
 * @returns React.JSX.Element
 */
export const PasswordField: React.FC<PasswordFieldProps> = ({ showToggle = true, ...rest }) => {
  const [isSecure, setIsSecure] = useState(true);

  const toggleSecure = () => {
    triggerHaptic('light');
    setIsSecure((prev) => !prev);
  };

  return (
    <Input
      secureTextEntry={isSecure}
      autoCapitalize="none"
      autoCorrect={false}
      rightIcon={
        showToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            onPress={toggleSecure}
            className="p-1"
          >
            {isSecure ? <Eye size={18} color="#5d8a72" /> : <EyeOff size={18} color="#0d3e26" />}
          </Pressable>
        ) : undefined
      }
      {...rest}
    />
  );
};
