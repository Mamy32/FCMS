import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api";

export function useList<T>(path: string) {
  return useQuery({ queryKey: [path], queryFn: () => api<T[]>(path) });
}

// Mutation that shows a toast and refreshes the given lists on success.
export function useApiMutation<TVars>(
  request: (vars: TVars) => { path: string; method: string; body?: unknown },
  { invalidate = [], success }: { invalidate?: string[]; success?: string } = {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => {
      const { path, method, body } = request(vars);
      return api(path, { method, body });
    },
    onSuccess: () => {
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      queryClient.invalidateQueries({ queryKey: ["/dashboard"] });
      if (success) toast.success(success);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
