import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { appId } from "../constants";

// Helper to get the expenses collection reference
const getExpensesRef = (uid, tripId) => {
    // Note: uid is kept in valid parameters for backward compatibility if needed, but unused for the new global path
    return collection(db, 'artifacts', appId, 'trips', tripId, 'expenses');
};

export const ExpenseService = {
    /**
     * Add a new expense
     */
    addExpense: async (uid, tripId, expenseData) => {
        try {
            const expensesRef = getExpensesRef(uid, tripId);
            const docRef = await addDoc(expensesRef, {
                ...expenseData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding expense:", error);
            throw error;
        }
    },

    /**
     * Delete an expense
     */
    deleteExpense: async (uid, tripId, expenseId) => {
        try {
            const expenseRef = doc(db, 'artifacts', appId, 'trips', tripId, 'expenses', expenseId);
            await deleteDoc(expenseRef);
        } catch (error) {
            console.error("Error deleting expense:", error);
            throw error;
        }
    },

    /**
     * Update an expense
     */
    updateExpense: async (uid, tripId, expenseId, updates) => {
        try {
            const expenseRef = doc(db, 'artifacts', appId, 'trips', tripId, 'expenses', expenseId);
            await updateDoc(expenseRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating expense:", error);
            throw error;
        }
    },

    /**
     * Subscribe to expenses for a trip
     * Returns an unsubscribe function
     */
    subscribeToExpenses: (uid, tripId, callback, errorCallback) => {
        const expensesRef = getExpensesRef(uid, tripId);
        // Removed secondary orderBy to avoid needing a composite index
        const q = query(expensesRef, orderBy("date", "desc"));

        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // secondary sort by createdAt client-side
            expenses.sort((a, b) => {
                // Primary: Date desc (already done by query, but safe to keep)
                if (b.date > a.date) return 1;
                if (b.date < a.date) return -1;

                // Secondary: CreatedAt desc
                const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
                const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
                return tB - tA;
            });

            callback(expenses);
        }, errorCallback);
    },

    /**
     * Calculate budget stats locally
     */
    calculateStats: (expenses, budgetTotal) => {
        const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const remaining = budgetTotal - totalSpent;
        const percentageUsed = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

        return {
            totalSpent,
            remaining,
            percentageUsed
        };
    }
};
