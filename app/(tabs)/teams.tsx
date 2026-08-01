import { useTranslation } from 'react-i18next';

import { EmptyState, Screen, StatusNote } from '@/components/ui';
import { clubs } from '@/content';

/**
 * The club list is empty on purpose and the empty state says why.
 * Inventing a club or a contact would be worse than showing nothing —
 * a girl acting on a fabricated phone number is a real harm.
 */
export default function TeamsScreen() {
  const { t } = useTranslation();

  if (clubs.length === 0) {
    return (
      <Screen>
        <EmptyState title={t('teamsEmptyTitle')} body={t('teamsEmptyBody')} />
        <StatusNote kind="todo">{t('teamsPolicy')}</StatusNote>
      </Screen>
    );
  }

  return <Screen />;
}
