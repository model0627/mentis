import { useChatStore } from "@/hooks/use-chat-store";
import { getChatT, type ChatTranslations } from "@/lib/chat-i18n";

export function useChatT(): ChatTranslations {
  const locale = useChatStore((s) => s.locale);
  return getChatT(locale);
}
