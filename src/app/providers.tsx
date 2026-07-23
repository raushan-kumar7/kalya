// import { ApiError } from "@/lib/api-client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactNode, useState } from "react";

// export function Providers({ children }: { children: ReactNode }) {
//   const [client] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 30_000,
//             retry: (failureCount, error) => {
//               if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
//                 return false;
//               }
//               return failureCount < 1;
//             },
//           },
//         },
//       })
//   );

//   return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
// }

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError } from "@/lib/api-client";

export function Providers({ children }: { children: React.ReactNode }) {
  // useState (not a module-level singleton) so each request on the server
  // gets its own client — sharing one across requests would leak cached
  // data between users during SSR.
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              // Don't retry 401/403/404 — retrying won't fix an auth or
              // not-found error, it'll just delay showing it.
              if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
