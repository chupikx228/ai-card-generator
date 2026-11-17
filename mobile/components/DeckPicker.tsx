import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '../theme'
import { BottomSheet } from './BottomSheet'

export type PickerOption = {
  value: string
  label: string
}

type DeckPickerProps = {
  value: string
  options: PickerOption[]
  onChange: (value: string) => void
  label: string
}

export const DeckPicker = ({ value, options, onChange, label }: DeckPickerProps) => {
  const [open, setOpen] = useState(false)
  const current = options.find((option) => option.value === value)

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? ''}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <Text style={styles.caption}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {current?.label ?? '—'}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      {open ? (
        <BottomSheet onClose={() => setOpen(false)}>
          <Text style={styles.sheetTitle}>{label}</Text>
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={options}
            keyExtractor={(option) => option.value}
            renderItem={({ item }) => {
              const selected = item.value === value
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(item.value)
                    setOpen(false)
                  }}
                  style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {selected ? <Text style={styles.tick}>✓</Text> : null}
                </Pressable>
              )
            }}
          />
        </BottomSheet>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  caption: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
  value: {
    flex: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.foreground,
  },
  chevron: {
    fontSize: 18,
    color: colors.muted,
    marginTop: -8,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.foreground,
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  option: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.foreground,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  tick: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
})
