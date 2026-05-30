import { toast } from "sonner";
import {
  doc, updateDoc, getDoc, collection,
  query, where, getDocs, writeBatch,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "./config";
import { auth } from "./config";

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile({ displayName, bio }) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");

  try {
    await Promise.all([
      updateProfile(auth.currentUser, { displayName }),
      updateDoc(doc(db, "users", uid), { name: displayName, bio }),
    ]);

    const ideasSnap = await getDocs(
      query(collection(db, "ideas"), where("creatorId", "==", uid))
    );
    if (!ideasSnap.empty) {
      const batch = writeBatch(db);
      ideasSnap.docs.forEach((d) => batch.update(d.ref, { creatorName: displayName }));
      await batch.commit();
    }

    toast.success("Profile updated");
  } catch (err) {
    toast.error("Failed to update profile");
    throw err;
  }
}
