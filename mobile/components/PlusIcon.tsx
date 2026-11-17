import { StyleSheet, View } from 'react-native'

export const PlusIcon = ({ size = 18, thickness = 2.5, color }: { size?: number; thickness?: number; color: string }) => (
  <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no">
    <View style={[styles.bar, { top: (size - thickness) / 2, width: size, height: thickness, backgroundColor: color }]} />
    <View style={[styles.bar, { left: (size - thickness) / 2, width: thickness, height: size, backgroundColor: color }]} />
  </View>
)

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    borderRadius: 2,
  },
})
