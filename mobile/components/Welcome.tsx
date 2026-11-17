import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from '../theme'
import { Button } from './Button'
import { AnswerFace, QuestionFace } from './CardFaces'
import { FlashCard } from './FlashCard'
import { PlusIcon } from './PlusIcon'
import { Sparkles } from './Sparkles'

type WelcomeProps = {
  onCreate: () => void
  onGenerate: () => void
}

export const Welcome = ({ onCreate, onGenerate }: WelcomeProps) => {
  const insets = useSafeAreaInsets()
  const [flipped, setFlipped] = useState(false)

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title} accessibilityRole="header">
        Картки, які допомагають запам’ятати
      </Text>
      <Text style={styles.lead}>
        Запишіть питання з одного боку й відповідь з іншого. Перевертайте картки, щоб перевірити себе, і відмічайте те, що вже
        вивчили.
      </Text>
      <View style={styles.demo}>
        <FlashCard
          style={styles.demoCard}
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          label="Приклад картки. Торкніться, щоб перевернути"
          front={<QuestionFace label="Англійська мова" question="Що означає слово «deck»?" />}
          back={<AnswerFace answer="Колода карт. Саме так ви збиратимете свої картки." />}
        />
        <Text style={styles.demoHint}>Торкніться картки, щоб перевернути її</Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Створити першу картку"
          icon={<PlusIcon size={14} thickness={2.5} color={colors.primaryForeground} />}
          onPress={onCreate}
        />
        <Button
          label="Згенерувати колоду з ШІ"
          variant="outline"
          icon={<Sparkles color={colors.primary} size={14} />}
          onPress={onGenerate}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
    flexGrow: 1,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: colors.foreground,
  },
  lead: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
  },
  demo: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  demoCard: {
    width: '82%',
    aspectRatio: 1.5,
    transform: [{ rotate: '-3deg' }],
  },
  demoHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
  actions: {
    gap: 10,
    marginTop: 'auto',
  },
})
