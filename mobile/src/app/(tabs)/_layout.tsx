import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { TabBar, TabButton, TabCreateAction } from '@/components/navigation/TabBar';

/**
 * Bottom navigation, built with the headless tabs from `expo-router/ui`.
 *
 * The router still owns the navigation (URLs, focus, per-tab state, tabPress);
 * only the bar's appearance is ours, because the design calls for a floating
 * pill with a protruding mint `+` that the stock tab bar cannot express.
 *
 * Slot order is the JSX order: Trips · Activity · (+) · Chat · Profile.
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />

      <TabList asChild>
        <TabBar>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton icon="compass" label="Trips" />
          </TabTrigger>

          <TabTrigger name="activity" href="/activity" asChild>
            <TabButton icon="notifications" label="Activity" />
          </TabTrigger>

          <TabCreateAction />

          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton icon="chatbubble-ellipses" label="Chat" />
          </TabTrigger>

          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="person" label="Profile" />
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}
