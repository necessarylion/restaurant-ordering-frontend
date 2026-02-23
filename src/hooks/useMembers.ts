import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { RestaurantMember } from "@/types";
import type { InviteMemberInput, UpdateMemberRoleInput } from "@/types/api";

export const useMembers = (restaurantId: number | undefined) => {
  return useQuery({
    queryKey: ["members", restaurantId],
    queryFn: () =>
      api.get<RestaurantMember[]>(endpoints.members.list(restaurantId!)),
    enabled: !!restaurantId,
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      data,
    }: {
      restaurantId: number;
      data: InviteMemberInput;
    }) => api.post(endpoints.members.invite(restaurantId), data),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", restaurantId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      memberId,
    }: {
      restaurantId: number;
      memberId: number;
    }) => api.delete(endpoints.members.remove(restaurantId, memberId)),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", restaurantId] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      memberId,
      data,
    }: {
      restaurantId: number;
      memberId: number;
      data: UpdateMemberRoleInput;
    }) =>
      api.put(endpoints.members.updateRole(restaurantId, memberId), data),
    onSuccess: (_, { restaurantId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", restaurantId] });
    },
  });
};
