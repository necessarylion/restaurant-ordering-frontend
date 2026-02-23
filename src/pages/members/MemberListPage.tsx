import { useState } from "react";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import {
  useMembers,
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MailAdd01Icon,
  Delete01Icon,
  Add01Icon,
  CrownIcon,
  ShieldUserIcon,
  UserIcon,
  Loading03Icon,
  Cancel01Icon,
  Clock04Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Role, MemberStatus, type RestaurantMember } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";

interface InviteRow {
  email: string;
  role: Role.ADMIN | Role.STAFF;
}

const roleConfig: Record<Role, { label: string; icon: typeof CrownIcon; className: string }> = {
  [Role.OWNER]: {
    label: "Owner",
    icon: CrownIcon,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [Role.ADMIN]: {
    label: "Admin",
    icon: ShieldUserIcon,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [Role.STAFF]: {
    label: "Staff",
    icon: UserIcon,
    className: "bg-muted text-muted-foreground",
  },
};

const statusConfig: Record<MemberStatus, { label: string; icon: typeof CheckmarkCircle02Icon; className: string }> = {
  [MemberStatus.ACCEPTED]: {
    label: "Active",
    icon: CheckmarkCircle02Icon,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  [MemberStatus.PENDING]: {
    label: "Pending",
    icon: Clock04Icon,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [MemberStatus.REJECTED]: {
    label: "Rejected",
    icon: Cancel01Icon,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const emptyInviteRow = (): InviteRow => ({ email: "", role: Role.STAFF });

export const MemberListPage = () => {
  const { currentRestaurant } = useRestaurant();
  const { confirm } = useAlertDialog();
  const restaurantId = currentRestaurant?.id;

  const { data: members, isLoading, error } = useMembers(restaurantId);
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteRows, setInviteRows] = useState<InviteRow[]>([emptyInviteRow()]);
  const [inviteErrors, setInviteErrors] = useState<Record<number, string>>({});
  const [isInviting, setIsInviting] = useState(false);

  if (!restaurantId) {
    return <ErrorCard title="No Restaurant" message="Please select a restaurant first." />;
  }

  const handleOpenInviteDialog = () => {
    setInviteRows([emptyInviteRow()]);
    setInviteErrors({});
    setShowInviteDialog(true);
  };

  const handleAddRow = () => {
    setInviteRows((prev) => [...prev, emptyInviteRow()]);
  };

  const handleRemoveRow = (index: number) => {
    setInviteRows((prev) => prev.filter((_, i) => i !== index));
    setInviteErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleRowChange = (index: number, field: keyof InviteRow, value: string) => {
    setInviteRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    setInviteErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInviteAll = async () => {
    const errors: Record<number, string> = {};
    inviteRows.forEach((row, i) => {
      if (!row.email.trim()) {
        errors[i] = "Email is required";
      } else if (!validateEmail(row.email)) {
        errors[i] = "Invalid email format";
      }
    });

    if (Object.keys(errors).length > 0) {
      setInviteErrors(errors);
      return;
    }

    setIsInviting(true);
    const newErrors: Record<number, string> = {};
    let successCount = 0;

    for (let i = 0; i < inviteRows.length; i++) {
      try {
        await inviteMember.mutateAsync({
          restaurantId,
          data: { email: inviteRows[i].email, role: inviteRows[i].role },
        });
        successCount++;
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        newErrors[i] = error.response?.data?.error || "Failed to invite";
      }
    }

    setIsInviting(false);

    if (Object.keys(newErrors).length > 0) {
      setInviteErrors(newErrors);
      // Remove successful rows
      setInviteRows((prev) => prev.filter((_, i) => i in newErrors));
    } else {
      setShowInviteDialog(false);
    }

    if (successCount > 0) {
      // Errors will show in dialog, successes already handled by mutation
    }
  };

  const handleRemoveMember = async (member: RestaurantMember) => {
    const name = member.user?.name || member.invitation_email;
    const confirmed = await confirm({
      title: `Remove ${name}?`,
      description: "This member will lose access to this restaurant.",
      confirmLabel: "Remove",
    });
    if (!confirmed) return;
    removeMember.mutate({ restaurantId, memberId: member.id });
  };

  const handleRoleChange = (member: RestaurantMember, newRole: Role) => {
    if (newRole === member.role) return;
    updateMemberRole.mutate({
      restaurantId,
      memberId: member.id,
      data: { role: newRole },
    });
  };

  if (error) {
    return <ErrorCard title="Error" message="Failed to load members." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Members" description={`Manage members for ${currentRestaurant?.name}`}>
        <Button onClick={handleOpenInviteDialog}>
          <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
          Invite Members
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !members?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No members yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Invite team members to help manage this restaurant
            </p>
            <Button onClick={handleOpenInviteDialog} className="mt-4">
              <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              Invite Members
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Member</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Invited By</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const role = roleConfig[member.role];
                const status = statusConfig[member.status];
                const isOwner = member.role === Role.OWNER;

                return (
                  <tr key={member.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {member.user?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user?.email || member.invitation_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isOwner ? (
                        <Badge className={role.className}>
                          <HugeiconsIcon icon={role.icon} strokeWidth={2} data-icon="inline-start" />
                          {role.label}
                        </Badge>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member, value as Role)}
                        >
                          <SelectTrigger className="w-28 h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Role.ADMIN}>
                              <HugeiconsIcon icon={ShieldUserIcon} strokeWidth={2} data-icon="inline-start" />
                              Admin
                            </SelectItem>
                            <SelectItem value={Role.STAFF}>
                              <HugeiconsIcon icon={UserIcon} strokeWidth={2} data-icon="inline-start" />
                              Staff
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={status.className}>
                        <HugeiconsIcon icon={status.icon} strokeWidth={2} data-icon="inline-start" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.inviter?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isOwner && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveMember(member)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Members Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => !open && setShowInviteDialog(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Add email addresses and assign roles. You can invite multiple members at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {inviteRows.map((row, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={row.email}
                    onChange={(e) => handleRowChange(index, "email", e.target.value)}
                    className={inviteErrors[index] ? "border-destructive" : ""}
                  />
                  {inviteErrors[index] && (
                    <p className="text-xs text-destructive mt-1">{inviteErrors[index]}</p>
                  )}
                </div>
                <Select
                  value={row.role}
                  onValueChange={(value) => handleRowChange(index, "role", value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    <SelectItem value={Role.STAFF}>Staff</SelectItem>
                  </SelectContent>
                </Select>
                {inviteRows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            className="w-full"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
            Add Another
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteAll} disabled={isInviting}>
              {isInviting ? (
                <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" data-icon="inline-start" />
              ) : (
                <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              )}
              {isInviting ? "Inviting..." : `Invite ${inviteRows.length > 1 ? `(${inviteRows.length})` : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
