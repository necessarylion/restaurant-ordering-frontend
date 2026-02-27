import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Logout03Icon,
} from "@hugeicons/core-free-icons";
import { Role, MemberStatus, type RestaurantMember } from "@/types";
import { ErrorCard } from "@/components/ErrorCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";

interface InviteRow {
  email: string;
  role: Role.ADMIN | Role.STAFF;
}

const roleConfig: Record<Role, { label: string; icon: typeof CrownIcon; className: string }> = {
  [Role.OWNER]: {
    label: "member.owner",
    icon: CrownIcon,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [Role.ADMIN]: {
    label: "member.admin",
    icon: ShieldUserIcon,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  [Role.STAFF]: {
    label: "member.staff",
    icon: UserIcon,
    className: "bg-muted text-muted-foreground",
  },
};

const statusConfig: Record<MemberStatus, { label: string; icon: typeof CheckmarkCircle02Icon; className: string }> = {
  [MemberStatus.ACCEPTED]: {
    label: "member.active",
    icon: CheckmarkCircle02Icon,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  [MemberStatus.PENDING]: {
    label: "member.pending",
    icon: Clock04Icon,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  [MemberStatus.REJECTED]: {
    label: "member.rejected",
    icon: Cancel01Icon,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const emptyInviteRow = (): InviteRow => ({ email: "", role: Role.STAFF });

export const MemberListPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentRestaurant, setCurrentRestaurant } = useRestaurant();
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
    return <ErrorCard title={t("common.noRestaurant")} message={t("common.selectRestaurantFirst")} />;
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
        errors[i] = t("member.emailRequired");
      } else if (!validateEmail(row.email)) {
        errors[i] = t("member.invalidEmail");
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
        newErrors[i] = error.response?.data?.error || t("member.failedToInvite");
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
    const isSelf = member.user_id === user?.id;
    const name = member.user?.name || member.invitation_email;
    const confirmed = await confirm({
      title: isSelf ? t("member.leaveRestaurant") : t("member.removeConfirm", { name }),
      description: isSelf
        ? t("member.leaveDescription")
        : t("member.removeDescription"),
      confirmLabel: isSelf ? t("common.leave") : t("common.remove"),
    });
    if (!confirmed) return;
    removeMember.mutate(
      { restaurantId, memberId: member.id },
      {
        onSuccess: () => {
          if (isSelf) {
            setCurrentRestaurant(null);
            navigate("/dashboard/restaurants");
          }
        },
      }
    );
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
    return <ErrorCard title={t("common.error")} message={t("member.failedToLoad")} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("member.title")} description={t("member.description", { name: currentRestaurant?.name })}>
        <Button onClick={handleOpenInviteDialog}>
          <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
          {t("member.inviteMembers")}
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
            <p className="text-sm font-medium">{t("member.noMembersYet")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("member.inviteSubtitle")}
            </p>
            <Button onClick={handleOpenInviteDialog} className="mt-4">
              <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              {t("member.inviteMembers")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">{t("member.memberHeader")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("member.roleHeader")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("member.statusHeader")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("member.invitedByHeader")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("member.actionsHeader")}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const role = roleConfig[member.role];
                const status = statusConfig[member.status];
                const isOwner = member.role === Role.OWNER;
                const isSelf = member.user_id === user?.id;

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
                      {isOwner || isSelf ? (
                        <Badge className={isOwner ? role.className : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}>
                          <HugeiconsIcon icon={role.icon} strokeWidth={2} data-icon="inline-start" />
                          {t(role.label)}
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
                              {t("member.admin")}
                            </SelectItem>
                            <SelectItem value={Role.STAFF}>
                              <HugeiconsIcon icon={UserIcon} strokeWidth={2} data-icon="inline-start" />
                              {t("member.staff")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={status.className}>
                        <HugeiconsIcon icon={status.icon} strokeWidth={2} data-icon="inline-start" />
                        {t(status.label)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.inviter?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isOwner && (
                        member.user_id === user?.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} data-icon="inline-start" />
                            {t("common.leave")}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} data-icon="inline-start" />
                            {t("common.remove")}
                          </Button>
                        )
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
            <DialogTitle>{t("member.inviteMembers")}</DialogTitle>
            <DialogDescription>
              {t("member.inviteDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {inviteRows.map((row, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder={t("member.emailPlaceholder")}
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
                    <SelectItem value={Role.ADMIN}>{t("member.admin")}</SelectItem>
                    <SelectItem value={Role.STAFF}>{t("member.staff")}</SelectItem>
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
            {t("member.addAnother")}
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleInviteAll} disabled={isInviting}>
              {isInviting ? (
                <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="animate-spin" data-icon="inline-start" />
              ) : (
                <HugeiconsIcon icon={MailAdd01Icon} strokeWidth={2} data-icon="inline-start" />
              )}
              {isInviting ? t("member.inviting") : inviteRows.length > 1 ? t("member.inviteCount", { count: inviteRows.length }) : t("member.invite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
