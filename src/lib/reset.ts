import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export async function performNeuralReset(userId: string) {
  const collectionsToWipe = ['investments', 'actions', 'clusters', 'revenue_nodes', 'ai_decisions', 'notifications'];
  
  const results = {
    deleted: 0,
    errors: [] as string[]
  };

  for (const colName of collectionsToWipe) {
    try {
      const q = query(collection(db, colName), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) continue;

      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
        results.deleted++;
      });
      
      await batch.commit();
    } catch (error) {
      console.error(`Error resetting ${colName}:`, error);
      results.errors.push(colName);
    }
  }

  return results;
}
