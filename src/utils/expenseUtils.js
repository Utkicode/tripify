
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
        const amount = Number(exp.amount) || 0;
        const paidBy = exp.paidBy || exp.userId; // Fallback to creator if paidBy missing

        // 1. Credit the payer
        if (balances[paidBy] === undefined) balances[paidBy] = 0;
        if (spending[paidBy] === undefined) spending[paidBy] = 0;

        balances[paidBy] += amount;
        spending[paidBy] += amount;

        // 2. Debit the split participants
        if (exp.splitDetails) {
            // New Schema
            Object.entries(exp.splitDetails).forEach(([uid, splitAmount]) => {
                if (balances[uid] === undefined) balances[uid] = 0;
                if (share[uid] === undefined) share[uid] = 0;

                balances[uid] -= splitAmount;
                share[uid] += splitAmount;
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
        if (amount < -0.01) debtors.push({ id, amount }); // use small epsilon for float safety
        if (amount > 0.01) creditors.push({ id, amount });
    });

    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first) - e.g. -100, -50
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first) - e.g. 100, 50

    const settlements = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];

        // The amount to settle is the minimum of the debt magnitude or the credit available
        let amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Round to 2 decimals
        amount = Math.round(amount * 100) / 100;

        if (amount > 0) {
            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount
            });
        }

        // Update remaining amounts
        debtor.amount += amount;
        creditor.amount -= amount;

        // Move indices if settled (allow small floating point tolerance)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return settlements;
};
