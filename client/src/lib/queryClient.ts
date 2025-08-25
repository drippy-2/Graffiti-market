import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<any> {
  const token = localStorage.getItem('access_token'); // Get token from localStorage

  const res = await fetch(url, {
    method,
    headers: Object.fromEntries(
      Object.entries({
        "Content-Type": data ? "application/json" : undefined,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }).filter(([_, v]) => v !== undefined)
    ) as HeadersInit,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401 }) =>
    async ({ queryKey }) => {
      const token = localStorage.getItem('access_token');
      const url = queryKey.join("/");

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401 && on401 === "returnNull") return null;

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
