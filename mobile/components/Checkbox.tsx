import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../theme'

type CheckboxProps = {
  checked: boolean
  onToggle: () => void
  label?: string
  tint?: string
}

export const Checkbox = ({ checked, onToggle, label, tint = colors.success }: CheckboxProps) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    accessibilityLabel={label}
    onPress={onToggle}
    hitSlop={8}
    style={styles.row}
  >
    <View style={[styles.box, checked && { backgroundColor: tint, borderColor: tint }]}>
      {checked ? <Text style={styles.check}>✓</Text> : null}
    </View>
    {label ? <Text style={styles.label}>{label}</Text> : null}
  </Pressable>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c9cbd0',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '800',
    marginTop: -1,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
})
