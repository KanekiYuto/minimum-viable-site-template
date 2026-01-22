"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@/store/useUserStore";
import { EditProfileModal } from "../../_components/EditProfileModal";
import { useUserStore } from "@/store/useUserStore";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const t = useTranslations("settings.profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateUser } = useUserStore();
  const displayName = user.name ?? "";
  const displayInitial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const avatarAlt = displayName || "User avatar";

  const handleSuccess = (updatedUser: User) => {
    updateUser(updatedUser);
  };

  return (
    <>
      <div className="bg-background-1 border border-background-2 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={avatarAlt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl md:text-2xl font-bold text-foreground">
                  {displayInitial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-foreground truncate">
                {displayName}
              </div>
              <div className="text-xs md:text-sm text-muted truncate">
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-background-2 hover:bg-background-3 border border-background-4 text-foreground text-sm font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            {t("editProfile")}
          </button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}
