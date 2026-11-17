import { Text } from 'react-native'

export const Sparkles = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Text style={{ color, fontSize: size }} accessibilityElementsHidden importantForAccessibility="no">
    ✦
  </Text>
)
