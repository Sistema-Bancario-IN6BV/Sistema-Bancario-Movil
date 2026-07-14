// src/navigation/headerOptions.js
// Opciones de header compartidas para los native-stack (tema navy).
import { FONT, FONT_SIZE } from '@/shared/constants/theme';

export function getStackHeaderOptions(colors) {
  return {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: colors.onPrimary,
    headerTitleStyle: { fontFamily: FONT.bold, fontSize: FONT_SIZE.title, color: colors.onPrimary },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}
