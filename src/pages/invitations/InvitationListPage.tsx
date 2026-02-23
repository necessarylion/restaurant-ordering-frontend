import { useNavigate } from "react-router-dom";
import { useInvitations, useAcceptInvitation } from "@/hooks/useInvitations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Store01Icon,
  ShieldUserIcon,
  UserIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Role, type RestaurantMember } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";

const roleLabels: Record<Role, { label: string; icon: typeof ShieldUserIcon }> = {
  [Role.OWNER]: { label: "Owner", icon: ShieldUserIcon },
  [Role.ADMIN]: { label: "Admin", icon: ShieldUserIcon },
  [Role.STAFF]: { label: "Staff", icon: UserIcon },
};

export const InvitationListPage = () => {
  const navigate = useNavigate();
  const { data: invitations, isLoading } = useInvitations();
  const acceptInvitation = useAcceptInvitation();

  const handleAccept = async (invitation: RestaurantMember) => {
    try {
      await acceptInvitation.mutateAsync(invitation.invitation_token!);
      // If no more invitations, redirect to restaurants
      const remaining = (invitations?.length ?? 0) - 1;
      if (remaining === 0) {
        navigate("/dashboard/restaurants");
      }
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invitations?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Invitations" />

      <div className="grid gap-3">
        {invitations.map((invitation) => {
          const role = roleLabels[invitation.role];
          return (
            <Card key={invitation.id} size="sm">
              <CardContent className="flex items-start gap-4">
                {invitation.restaurant?.logo ? (
                  <img
                    src={invitation.restaurant.logo}
                    alt={invitation.restaurant.name}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                    <HugeiconsIcon icon={Store01Icon} strokeWidth={2} className="size-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {invitation.restaurant?.name || "Unknown Restaurant"}
                  </p>
                  {invitation.restaurant?.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {invitation.restaurant.address}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <HugeiconsIcon icon={role.icon} strokeWidth={2} data-icon="inline-start" />
                      {role.label}
                    </Badge>
                    {invitation.inviter && (
                      <span className="text-xs text-muted-foreground">
                        Invited by {invitation.inviter.name}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleAccept(invitation)}
                  disabled={acceptInvitation.isPending}
                  size="sm"
                  className="self-center"
                >
                  {acceptInvitation.isPending ? (
                    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} data-icon="inline-start" />
                  )}
                  Accept
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
