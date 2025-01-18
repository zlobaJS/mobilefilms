import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../config/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google sign in...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign in successful:", result.user.uid);

      // Создаем или обновляем документ пользователя
      const userRef = doc(db, "users", result.user.uid);

      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      console.log("Attempting to save user data:", userData);

      try {
        await setDoc(userRef, userData, { merge: true });
        console.log("User data successfully saved to Firestore");

        // Немедленно обновляем состояние пользователя
        setUser(result.user);
      } catch (firestoreError) {
        console.error("Firestore save error:", firestoreError);
        console.log("Current user UID:", auth.currentUser?.uid);
        console.log("Target document path:", userRef.path);
      }

      return result.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Немедленно очищаем состояние пользователя
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, logout };
};
