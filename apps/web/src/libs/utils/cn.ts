// import clsx, { ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// export const cn = (...inputs: ClassValue[]) => {
//   return twMerge(clsx(inputs));
// };

import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'display-md',
            'body-lg',
            'body-md',
            'body-sm',
            'caption',
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
