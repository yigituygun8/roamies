import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';

/**
 * Chat tab: the travel assistant, not a group chat between members.
 *
 * The design doc reserves this slot for the LLM assistant so it has a home from
 * day one. Until the assistant is wired up, this is a friendly placeholder.
 */
export default function ChatScreen() {
  return (
    <ScreenPlaceholder
      icon="chatbubble-ellipses-outline"
      title="Your trip assistant"
      message="Soon you can ask why a place made the plan, or what to do on a rainy afternoon."
      action={{ label: 'Go to your trips', to: '/home' }}
      insideTabs
    />
  );
}
