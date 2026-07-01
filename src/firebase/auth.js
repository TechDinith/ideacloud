import { toast } from "sonner";
import { auth, db } from "./config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    if (!result) return;
    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "Anonymous",
        email: user.email,
        bio: "",
        createdAt: serverTimestamp(),
      });
    }
    toast.success("Signed in as " + (user.displayName || user.email));
    return result;
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      toast.error("Sign in failed");
    }
  }
}

export const logOut = async () => {
  await signOut(auth);
  toast.success("Signed out");
};
