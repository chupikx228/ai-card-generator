import { type ReactNode, useEffect, useRef } from 'react'
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, overlay } from '../theme'

type BottomSheetProps = {
  onClose: () => void
  children: ReactNode
}

const HIDDEN_OFFSET = 600

export const BottomSheet = ({ onClose, children }: BottomSheetProps) => {
  const insets = useSafeAreaInsets()
  const offset = useRef(new Animated.Value(HIDDEN_OFFSET)).current

  useEffect(() => {
    Animated.timing(offset, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [offset])

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрити" />
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + 16, maxHeight: '90%', transform: [{ translateY: offset }] }]}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
})
