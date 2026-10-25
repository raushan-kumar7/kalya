import React from 'react';
import { ErrorCard, ErrorCardProps } from './error-card';

export interface ErrorStateProps extends ErrorCardProps {}

/**
 * ErrorState delivers a friendly failure message with a clear Retry action.
 *
 * @param props - ErrorStateProps
 * @returns React.JSX.Element
 */
export const ErrorState: React.FC<ErrorStateProps> = (props) => {
  return <ErrorCard {...props} />;
};
