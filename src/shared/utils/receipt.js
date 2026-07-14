// src/shared/utils/receipt.js
// Descarga el comprobante PDF de una transacción desde el backend y lo comparte
// con el sheet nativo. Si falla (sin red, endpoint no disponible, etc.), cae a
// compartir el resumen en texto plano.
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import bankClient from '@/shared/api/bankClient';

export async function shareTransactionReceipt(transactionId, fallbackMessage) {
  try {
    if (!transactionId) throw new Error('Missing transaction id');

    const res = await bankClient.get(`/transactions/${transactionId}/receipt`, {
      responseType: 'arraybuffer',
    });

    const file = new File(Paths.cache, `comprobante-${transactionId}.pdf`);
    file.create({ overwrite: true });
    file.write(new Uint8Array(res.data));

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) throw new Error('Sharing not available');

    await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  } catch {
    if (fallbackMessage) {
      await Share.share({ message: fallbackMessage });
    }
  }
}

export default shareTransactionReceipt;
