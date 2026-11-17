import { type ReactNode, useEffect, useRef } from 'react'
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from 'react-native'
import { colors, lift, overlay } from '../theme'

type DialogProps = {
  onClose: () => void
  children: ReactNode
}

export const Dialog = ({ onClose, children }: DialogProps) => {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [progress])

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрити" />
        <Animated.View
          style={[
            styles.card,
            {
              opacity: progress,
              transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: overlay,
  },
  card: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    ...lift,
  },
})
