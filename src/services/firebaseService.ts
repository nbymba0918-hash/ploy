import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  DebtorRight,
  MonthlyLedgerArchive,
  ReportSignatureInfo,
  NotificationLog,
  AppUser,
} from '../types';
import { INITIAL_DEBTOR_RIGHTS, DEFAULT_SIGNATURE_INFO } from '../data/initialRights';

const RIGHTS_COLLECTION = 'debtorRights';
const ARCHIVES_COLLECTION = 'monthlyArchives';
const LOGS_COLLECTION = 'notificationLogs';
const SETTINGS_COLLECTION = 'settings';
const USERS_COLLECTION = 'users';

// 1. Seed initial 52 rights if empty
export async function seedInitialDataIfEmpty() {
  const path = RIGHTS_COLLECTION;
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log('Seeding initial 52 debtor rights to Firebase Firestore...');
      const batch = writeBatch(db);
      INITIAL_DEBTOR_RIGHTS.forEach((right) => {
        const docRef = doc(db, RIGHTS_COLLECTION, String(right.id));
        batch.set(docRef, right);
      });
      // Also seed signatures
      const sigRef = doc(db, SETTINGS_COLLECTION, 'reportSignatures');
      batch.set(sigRef, DEFAULT_SIGNATURE_INFO);
      await batch.commit();
      console.log('52 debtor rights successfully seeded to Firebase!');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 2. Real-time subscribe to 52 Debtor Rights
export function subscribeToDebtorRights(
  onData: (rights: DebtorRight[]) => void,
  onError?: (err: Error) => void
) {
  const path = RIGHTS_COLLECTION;
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_DEBTOR_RIGHTS);
        return;
      }
      const rights: DebtorRight[] = [];
      snapshot.forEach((d) => {
        rights.push(d.data() as DebtorRight);
      });
      // Sort by id 1-52
      rights.sort((a, b) => a.id - b.id);
      onData(rights);
    },
    (error) => {
      console.error('Error fetching debtor rights from Firebase:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 3. Update single debtor right in Firebase
export async function saveDebtorRightToFirebase(right: DebtorRight): Promise<void> {
  const path = `${RIGHTS_COLLECTION}/${right.id}`;
  try {
    const docRef = doc(db, RIGHTS_COLLECTION, String(right.id));
    await setDoc(docRef, right, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Batch update all debtor rights in Firebase (e.g. after reconciliation or restore)
export async function batchSaveDebtorRightsToFirebase(rights: DebtorRight[]): Promise<void> {
  const path = RIGHTS_COLLECTION;
  try {
    const batch = writeBatch(db);
    rights.forEach((right) => {
      const docRef = doc(db, RIGHTS_COLLECTION, String(right.id));
      batch.set(docRef, right);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Subscribe to Monthly Archives
export function subscribeToMonthlyArchives(
  onData: (archives: MonthlyLedgerArchive[]) => void
) {
  const path = ARCHIVES_COLLECTION;
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: MonthlyLedgerArchive[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as MonthlyLedgerArchive);
      });
      // Sort by savedAt descending
      list.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 6. Save Monthly Archive
export async function saveMonthlyArchiveToFirebase(archive: MonthlyLedgerArchive): Promise<void> {
  const path = `${ARCHIVES_COLLECTION}/${archive.id}`;
  try {
    const docRef = doc(db, ARCHIVES_COLLECTION, archive.id);
    await setDoc(docRef, archive);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 7. Subscribe to Signatures
export function subscribeToSignatures(
  onData: (sigs: ReportSignatureInfo) => void
) {
  const path = `${SETTINGS_COLLECTION}/reportSignatures`;
  const docRef = doc(db, SETTINGS_COLLECTION, 'reportSignatures');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as ReportSignatureInfo);
      } else {
        onData(DEFAULT_SIGNATURE_INFO);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 8. Save Signatures
export async function saveSignaturesToFirebase(signatures: ReportSignatureInfo): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/reportSignatures`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'reportSignatures');
    await setDoc(docRef, signatures);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 9. Subscribe to Notification Logs
export function subscribeToNotificationLogs(
  onData: (logs: NotificationLog[]) => void
) {
  const path = LOGS_COLLECTION;
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: NotificationLog[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as NotificationLog);
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// 10. Save Notification Log
export async function saveNotificationLogToFirebase(log: NotificationLog): Promise<void> {
  const path = `${LOGS_COLLECTION}/${log.id}`;
  try {
    const docRef = doc(db, LOGS_COLLECTION, log.id);
    await setDoc(docRef, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 11. Save/Update User Profile
export async function saveUserProfileToFirebase(user: AppUser): Promise<void> {
  const path = `${USERS_COLLECTION}/${user.id}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 12. Subscribe to Users
export function subscribeToUsers(
  onData: (users: AppUser[]) => void
) {
  const path = USERS_COLLECTION;
  const colRef = collection(db, path);

  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        return;
      }
      const list: AppUser[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AppUser);
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
