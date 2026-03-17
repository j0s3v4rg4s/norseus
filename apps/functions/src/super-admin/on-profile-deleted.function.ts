import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { PROFILE_COLLECTION, SUPER_ADMIN_COLLECTION } from '@models/user';

export const onProfileDeleted = onDocumentDeleted(
  `${PROFILE_COLLECTION}/{uid}`,
  async (event) => {
    const uid = event.params.uid;
    const db = getFirestore();

    const ref = db.collection(SUPER_ADMIN_COLLECTION).doc(uid);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
    }
  },
);
