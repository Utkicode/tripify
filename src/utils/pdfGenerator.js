import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { appId } from '../constants';
import { getCurrencySymbol } from './currency.js';

/**
 * Fetch all expenses for a list of trips.
 * Since expenses are stored in 'days' sub-collections -> activities,
 * we need to fetch all days for each trip and extracting activities with cost > 0.
 */
export const fetchAllExpenses = async (trips) => {
    const enrichmentPromises = trips.map(async (trip) => {
        try {
            // Updated Path: Fetch from the dedicated 'expenses' sub-collection
            const expensesRef = collection(db, 'artifacts', appId, 'trips', trip.id, 'expenses');
            const expensesSnap = await getDocs(expensesRef);

            let tripExpenses = [];

            expensesSnap.forEach(doc => {
                const data = doc.data();
                // ONLY include items with a positive amount
                if (data.amount > 0) {
                    tripExpenses.push({
                        ...data,
                        id: doc.id,
                        cost: Number(data.amount) || 0, // Map 'amount' to 'cost' for PDF compatibility
                        activityName: data.description || data.category || 'Expense', // Map description to name
                        date: data.date,
                        tripName: trip.tripName,
                        paidBy: data.paidBy || 'Me'
                    });
                }
            });

            return {
                ...trip,
                expenses: tripExpenses,
                totalActualSpend: tripExpenses.reduce((sum, item) => sum + (item.cost || 0), 0)
            };
        } catch (error) {
            console.error(`Error fetching expenses for trip ${trip.id}:`, error);
            return { ...trip, expenses: [], totalActualSpend: 0 };
        }
    });

    return Promise.all(enrichmentPromises);
};

function safeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export const generateExpenseReport = async (user, profile, tripsList, currencyCode) => {
    const symbol = getCurrencySymbol(currencyCode || profile?.behavior?.defaultCurrency || 'USD');
    // 1. Fetch Data
    const enrichedTrips = await fetchAllExpenses(tripsList);

    // 2. Initialize PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41); // Slate 900
    doc.text("TravelCFO - Consolidated Travel Expense Report", 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125); // Slate 500

    const today = format(new Date(), 'dd MMM yyyy');
    const completeness = profile?.metadata?.completenessScore
        ? Math.round(profile.metadata.completenessScore * 100)
        : 0;

    doc.text(`Prepared for: ${user.displayName || 'Traveler'}`, 14, 30);
    // doc.text(`Email: ${user.email}`, 14, 35); // user.email might be missing if relying on auth object only, but usually there
    doc.text(`Email: ${user.email || 'N/A'}`, 14, 35);

    doc.text(`Generated on: ${today}`, pageWidth - 14, 30, { align: 'right' });
    doc.text(`Profile Completion: ${completeness}%`, pageWidth - 14, 35, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 40, pageWidth - 14, 40);

    // --- Executive Summary ---
    let yPos = 50;
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Executive Summary", 14, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(73, 80, 87);
    doc.text("A high-level snapshot of your travel spending so far.", 14, yPos);

    // Calculate Aggregates
    const totalTrips = enrichedTrips.length;
    const totalSpend = enrichedTrips.reduce((sum, t) => sum + t.totalActualSpend, 0);
    const avgSpend = totalTrips > 0 ? totalSpend / totalTrips : 0;

    // Find Highest Category
    const categoryTotals = {};
    let lastExpenseDate = null;

    enrichedTrips.forEach(trip => {
        trip.expenses.forEach(exp => {
            const cat = exp.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.cost;
            if (!lastExpenseDate || exp.date > lastExpenseDate) lastExpenseDate = exp.date;
        });
    });

    const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const highestCatName = highestCategory ? highestCategory[0] : 'N/A';

    yPos += 10;
    const stats = [
        [`Total Trips: ${totalTrips}`, `Total Spend: ${symbol} ${totalSpend.toLocaleString()}`],
        [`Average Spend per Trip: ${symbol} ${Math.round(avgSpend).toLocaleString()}`, `Highest Spend Category: ${highestCatName}`],
        [`Last Expense Logged: ${safeDate(lastExpenseDate) ? format(safeDate(lastExpenseDate), 'dd MMM yyyy') : 'N/A'}`]
    ];

    autoTable(doc, {
        startY: yPos,
        body: stats,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { fontStyle: 'bold' } }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- Trip Overview ---
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Trip Overview", 14, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(73, 80, 87);
    doc.text("A summary of all trips included in this report.", 14, yPos);

    yPos += 5;

    const tripRows = enrichedTrips.map(t => [
        t.tripName,
        safeDate(t.createdAt) ? format(safeDate(t.createdAt), 'dd MMM yyyy') : '—',
        t.destination || '—', // Destination isn't always set in trip root?
        t.travelerCount || 1,
        `${symbol} ${t.totalActualSpend.toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Trip Name', 'Created On', 'Destination', 'Travelers', 'Total Spend']],
        body: tripRows,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- Detailed Breakdown (Per Trip) ---
    doc.setFontSize(14);
    doc.setTextColor(33, 37, 41);
    doc.text("Detailed Expense Breakdown", 14, yPos);
    yPos += 10;

    enrichedTrips.forEach(trip => {
        // Check page break
        if (yPos > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Trip: ${trip.tripName}`, 14, yPos);
        yPos += 5;

        // Trip Expenses Table
        const expenseRows = trip.expenses.map(e => [
            safeDate(e.date) ? format(safeDate(e.date), 'dd MMM yyyy') : '',
            e.activityName || e.description || 'Expense',
            e.category || 'Misc',
            e.paidBy,
            `${symbol} ${e.cost.toLocaleString()}`
        ]);

        if (expenseRows.length > 0) {
            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Description', 'Category', 'Paid By', 'Amount']],
                body: expenseRows,
                theme: 'grid',
                headStyles: { fillColor: [100, 116, 139] }, // Slate 500
                styles: { fontSize: 9 }
            });

            // Total Row
            yPos = doc.lastAutoTable.finalY + 2;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Total Spend (${trip.tripName}): ${symbol} ${trip.totalActualSpend.toLocaleString()}`, 14, yPos + 5);
            yPos += 15;
        } else {
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(150);
            doc.text("(No expenses logged for this trip)", 14, yPos + 5);
            yPos += 15;
            doc.setTextColor(33, 37, 41); // Reset
            doc.setFont(undefined, 'normal');
        }
    });

    // --- Category Summary ---
    // Check page break
    if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Category Summary", 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Where your money went.", 14, yPos);
    yPos += 5;

    const categoryRows = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]) // Descending
        .map(([cat, amount]) => [
            cat,
            `${symbol} ${amount.toLocaleString()}`,
            `${totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0}%`
        ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Total Spend', '% of Total']],
        body: categoryRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo (Brandish)
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- Footer / Notes ---
    if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Notes & Disclaimers", 14, yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text("All amounts are calculated based on logged expenses at the time of report generation.", 14, yPos);
    doc.text("This report is for informational purposes and does not include pending or unlogged expenses.", 14, yPos + 5);

    // Save
    doc.save(`TravelCFO_Global_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
