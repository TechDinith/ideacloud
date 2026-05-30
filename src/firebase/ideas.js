import { toast } from "sonner";
import { db } from "./config";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const IDEAS = "ideas";

function randomCardColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30 + 50);
  const l = Math.floor(Math.random() * 20 + 30);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export async function addIdea({ title, brief, category, creatorId, creatorName }) {
  try {
    const docRef = await addDoc(collection(db, IDEAS), {
      title,
      brief,
      category,
      cardColor: randomCardColor(),
      creatorId,
      creatorName,
      createdAt: serverTimestamp(),
    });
    toast.success("Idea posted!");
    return docRef.id;
  } catch (err) {
    toast.error("Failed to post idea");
    throw err;
  }
}

export async function fetchIdeas({ pageSize = 6, cursor } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (cursor) constraints.splice(0, 0, startAfter(cursor));
  const q = query(collection(db, IDEAS), ...constraints);
  const snapshot = await getDocs(q);
  return {
    ideas: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
}

export async function deleteIdea(ideaId) {
  try {
    await deleteDoc(doc(db, IDEAS, ideaId));
    toast.success("Idea deleted");
  } catch (err) {
    toast.error("Failed to delete idea");
    throw err;
  }
}

export async function fetchUserIdeas(uid) {
  const q = query(collection(db, IDEAS), where("creatorId", "==", uid));
  const snapshot = await getDocs(q);
  const ideas = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  ideas.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
  return ideas;
}
