import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../theme'
import { Button } from './Button'
import { Dialog } from './Dialog'

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) => (
  <Dialog onClose={onClose}>
    <ConfirmContent title={title} message={message} confirmLabel={confirmLabel} onConfirm={onConfirm} onCancel={onClose} />
  </Dialog>
)

type ConfirmContentProps = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmContent = ({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmContentProps) => (
  <View style={styles.body}>
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
    <Text style={styles.message}>{message}</Text>
    <View style={styles.actions}>
      <Button label="Скасувати" variant="outline" onPress={onCancel} style={styles.flex} />
      <Button label={confirmLabel} variant="danger" onPress={onConfirm} style={styles.flex} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    color: colors.foreground,
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  flex: {
    flex: 1,
  },
})
