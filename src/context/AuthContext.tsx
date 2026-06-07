import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  coins: number;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  buyCoins: (amount: number) => Promise<void>;
  deductCoin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // subscribe to user doc
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCoins(docSnap.data().coins || 0);
          } else {
            // init user doc
            setDoc(userRef, { coins: 10, email: currentUser.email, displayName: currentUser.displayName })
              .catch(e => console.error("Error creating user doc", e));
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore error", error);
          setLoading(false);
        });
        return unsubDoc;
      } else {
        setCoins(0);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Sign in error', e);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const buyCoins = async (amount: number) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, { 
        coins: increment(amount),
        email: user.email,
        displayName: user.displayName 
      }, { merge: true });
    } catch (e) {
      console.error("Error buying coins", e);
    }
  };

  const deductCoin = async () => {
    if (!user) return false;
    if (coins <= 0) return false;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { coins: increment(-1) });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, coins, loading, signIn, signOut, buyCoins, deductCoin }}>
      {children}
    </AuthContext.Provider>
  );
};
