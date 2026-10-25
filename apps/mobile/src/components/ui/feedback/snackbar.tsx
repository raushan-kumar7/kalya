import React from 'react';
import { UndoSnackBar, UndoSnackBarProps } from './undo-snack-bar';

export interface SnackbarProps extends UndoSnackBarProps {}

/**
 * Snackbar provides notification pills with an actionable rollback option ("Deleted · Undo").
 *
 * @param props - SnackbarProps
 * @returns React.JSX.Element | null
 */
export const Snackbar: React.FC<SnackbarProps> = (props) => {
  return <UndoSnackBar {...props} />;
};

export const Toast = Snackbar;
