"use client";

import { LoginModal } from "@/components/modals/LoginModal";
import { useModalStore } from "@/store/useModalStore";

export function ModalProvider() {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();

  return <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />;
}
