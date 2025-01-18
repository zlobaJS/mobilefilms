import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

// Определяем интерфейс для данных пользователя из Firestore
interface FirestoreUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLogin: string;
}

export const useUserData = (userId?: string) => {
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!userId) {
          // Если userId не передан, показываем текущего пользователя
          if (currentUser) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              setUserData(userDoc.data() as FirestoreUser);
            } else {
              // Если данных в Firestore нет, создаем базовый объект
              setUserData({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              });
            }
          } else {
            setUserData(null);
          }
        } else {
          // Получаем данные пользователя из Firestore
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as FirestoreUser);
          } else {
            setUserData(null);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(null);
        setLoading(false);
      }
    };

    // Добавляем слушатель изменений состояния авторизации
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchData();
    });

    fetchData();

    return () => unsubscribe();
  }, [userId]);

  return { userData, loading };
};
