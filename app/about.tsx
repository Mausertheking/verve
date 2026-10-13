import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/controls';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { Screen, SectionLabel } from '@/components/ui';
import { VerveMark } from '@/components/VerveMark';
import { useProgress } from '@/storage/progress';
import { colors, serif, space, type } from '@/theme';

/**
 * About, privacy and sources. The privacy policy lives here in full as well as
 * on the web, because App Review expects it to be reachable inside the app —
 * and Verve has no network, so it has to be text, not a link.
 */
export default function AboutScreen() {
  const { t } = useTranslation();
  const { reset } = useProgress();
  const [armed, setArmed] = useState(false);
  const [cleared, setCleared] = useState(false);
  const version = Constants.expoConfig?.version ?? '';

  return (
    <>
      <Stack.Screen options={{ title: t('about'), presentation: 'modal' }} />
      <Screen>
        <View style={styles.brand}>
          <VerveMark size={56} />
          <Text style={styles.title}>{t('aboutTitle')}</Text>
        </View>
        <Text style={styles.lead}>{t('aboutLead')}</Text>

        <SectionLabel n={1}>{t('language')}</SectionLabel>
        <View style={styles.lang}><LanguageSwitch /></View>

        <SectionLabel n={2}>{t('privacyTitle')}</SectionLabel>
        <Text style={styles.body}>{t('privacyBody')}</Text>

        <SectionLabel n={3}>{t('sourcesTitle')}</SectionLabel>
        <Text style={styles.body}>{t('sourcesBody')}</Text>

        <SectionLabel n={4}>{t('supportTitle')}</SectionLabel>
        <Text style={styles.body}>{t('supportBody')}</Text>

        <View style={styles.reset}>
          <Button
            variant="ghost"
            label={cleared ? `✓ ${t('resetDone')}` : armed ? t('resetConfirm') : t('resetProgress')}
            disabled={cleared}
            onPress={() => {
              if (!armed) return setArmed(true);
              reset();
              setCleared(true);
            }}
          />
        </View>

        <Text style={styles.version}>{`Verve · ${t('versionLabel')} ${version}`}</Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'flex-start', gap: space.lg, marginTop: space.md },
  title: { ...type.display, color: colors.textPrimary },
  lead: { ...type.body, fontSize: 17, lineHeight: 28, color: colors.textPrimary, marginTop: space.lg },
  lang: { alignSelf: 'flex-start' },
  body: { ...type.body, color: colors.textSecondary },
  reset: { marginTop: space.xxl },
  version: { fontFamily: serif, fontStyle: 'italic', fontSize: 13, color: colors.textSecondary, marginTop: space.xl, textAlign: 'center' },
});
