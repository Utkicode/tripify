
export const calculateTripBalances = (expenses = [], travelers = [], currentUserId) => {
    const balances = {}; // { userId: netAmount } (+ve means you are owed, -ve means you owe)
    const spending = {}; // { userId: totalPaid }
    const share = {};    // { userId: totalShareOfExpenses }

    // Initialize
    travelers.forEach(t => {
        balances[t.id] = 0;
        spending[t.id] = 0;
        share[t.id] = 0;
    });

    expenses.forEach(exp => {
        const amount = Number(exp.amount);
        if (isNaN(amount) || amount <= 0) return; // Skip invalid/negative expenses entirely
        const paidBy = exp.paidBy || exp.userId; // Fallback to creator if paidBy missing

        // 1. Credit the payer
        if (balances[paidBy] === undefined) balances[paidBy] = 0;
        if (spending[paidBy] === undefined) spending[paidBy] = 0;

        balances[paidBy] += amount;
        spending[paidBy] += amount;

        // 2. Debit the split participants
        if (exp.splitDetails) {
            const totalSplit = Object.values(exp.splitDetails).reduce((sum, v) => sum + Number(v || 0), 0);
            // Only process splits if they roughly match the expense amount (within 2 cents)
            if (Math.abs(totalSplit - amount) > 0.02) return; // Skip malformed splits
            Object.entries(exp.splitDetails).forEach(([uid, splitAmount]) => {
                if (balances[uid] === undefined) balances[uid] = 0;
                if (share[uid] === undefined) share[uid] = 0;
                balances[uid] -= Number(splitAmount) || 0;
                share[uid] += Number(splitAmount) || 0;
            });
        } else {
            // Old Schema (Assume equal split among everyone? Or just creator?)
            // Fallback: Assume the creator paid for themselves only (net 0) for now to be safe,
            // OR assume equal split among all travelers if it was a group trip.
            // Let's assume for legacy data: Paid by Creator, Split Equally among Start Travelers logic.
            // However, legacy data might just be personal expenses. Let's treat legacy as "Personal" (Share = Amount, Payer = Creator) -> Net 0.
            if (balances[paidBy] !== undefined) {
                balances[paidBy] -= amount; // Revert the credit, treat as personal
                share[paidBy] += amount;
            }
        }
    });

    return {
        balances,
        spending,
        share,
        myBalance: balances[currentUserId] || 0
    };
};

export const calculateSettlements = (balances) => {
    let debtors = [];
    let creditors = [];

    Object.entries(balances).forEach(([id, amount]) => {
        const amountInCents = Math.round(amount * 100);
        if (amountInCents < 0) debtors.push({ id, amount: amountInCents });
        if (amountInCents > 0) creditors.push({ id, amount: amountInCents });
    });

    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const settlements = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of the debt magnitude or the credit available
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        if (amount > 0) {
            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round((amount / 100) * 100) / 100 // Convert back to dollars with 2 decimal precision
            });
        }

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move indices if settled
        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }

    return settlements;
};
