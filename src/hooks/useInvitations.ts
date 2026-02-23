import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RestaurantMember } from "@/types";

export const useInvitations = () => {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: () => api.get<RestaurantMember[]>(endpoints.invitations.list),
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      api.post(endpoints.invitations.accept(token)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};
