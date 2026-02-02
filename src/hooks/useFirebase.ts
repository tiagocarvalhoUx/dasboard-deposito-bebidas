import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export function useCollection<T>(collectionName: string, filters?: { field: string; operator: any; value: any }[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    
    let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    
    if (filters) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = useCallback(async (item: Omit<T, 'id'>) => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }, [collectionName]);

  const update = useCallback(async (id: string, item: Partial<T>) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: Timestamp.now()
    });
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }, [collectionName]);

  return { data, loading, error, add, update, remove };
}

export function useDocument<T>(collectionName: string, docId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(docRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  const update = useCallback(async (item: Partial<T>) => {
    if (!docId) return;
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...item,
      updatedAt: Timestamp.now()
    });
  }, [collectionName, docId]);

  return { data, loading, error, update };
}
