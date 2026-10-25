import React from 'react';
import { Input, InputProps } from './input';

export interface TextFieldProps extends InputProps {}

/**
 * TextField provides a standardized form text input with label,
 * helper text, error message, and left/right icon slots.
 *
 * @param props - TextFieldProps
 * @returns React.JSX.Element
 */
export const TextField: React.FC<TextFieldProps> = (props) => {
  return <Input {...props} />;
};
