import { StyleSheet, Text, View } from 'react-native';

import { onPhoto, useTheme } from '@/lib/theme';
import type { TripMember } from '@/types/trip';

/** Avatar fills, fixed so a member keeps the same colour across screens. */
const AVATAR_COLORS = ['#09E2A1', '#F4C95D', '#BFD0FF', '#F3A6A0', '#C9B6F7'];

type Props = {
  members: TripMember[];
  /** How many faces to show before the `+N` bubble. */
  max?: number;
  /** Hero cards sit on a photo and need a ring that separates the circles. */
  onPhoto?: boolean;
  size?: number;
};

/**
 * Up to `max` initials plus an overflow bubble.
 *
 * Colours are decorative and derived from the member id; the accessible label
 * spells the group out ("Osman, Mia, Jonas and 2 more") so the faces are not
 * the only way to read this.
 */
export function AvatarStack({
  members,
  max = 3,
  onPhoto: isOnPhoto = false,
  size = 26,
}: Props) {
  const theme = useTheme();

  if (members.length === 0) return null;

  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  const ringColor = isOnPhoto ? `rgba(${onPhoto.scrimRgb}, 0.45)` : theme.surface;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={formatMemberNames(visible, overflow)}
      style={styles.container}
    >
      {visible.map((member, index) => (
        <View
          key={member.id}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: index === 0 ? 0 : -size / 3,
              zIndex: visible.length - index,
              backgroundColor: avatarColor(member.id),
              borderColor: ringColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: Math.round(size * 0.38) }]}>
            {member.initials}
          </Text>
        </View>
      ))}

      {overflow > 0 ? (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size / 3,
              borderColor: ringColor,
              backgroundColor: isOnPhoto
                ? 'rgba(255, 255, 255, 0.24)'
                : theme.surfaceSubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: Math.round(size * 0.34),
                color: isOnPhoto ? onPhoto.text : theme.text,
              },
            ]}
          >
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function avatarColor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

function formatMemberNames(visible: TripMember[], overflow: number): string {
  const names = visible.map((member) => member.name);
  if (names.length === 0) return '';
  if (overflow > 0) return `${names.join(', ')} and ${overflow} more`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  initials: {
    // Dark ink works on every fill in the palette.
    color: '#0B1220',
    fontWeight: '700',
  },
});
