import { toast } from "sonner";
import { auth, db } from "./config";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const provider = new GoogleAuthProvider();

getRedirectResult(auth).then(async (result) => {
  if (result) {
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
  }
}).catch(() => {});

export async function signInWithGoogle() {
  try {
    await signInWithRedirect(auth, provider);
  } catch {
    toast.error("Sign in failed");
  }
}

export const logOut = async () => {
  await signOut(auth);
  toast.success("Signed out");
};
