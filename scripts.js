document.addEventListener('DOMContentLoaded', () => {
    const entryTypeSelect = document.getElementById('entry-type');
    const dateRow = document.getElementById('date-row');
    const amountRow = document.getElementById('amount-row');
    const descriptionRow = document.getElementById('description-row');
    const form = document.getElementById('data-form');
    const totalProfitElement = document.getElementById('totalProfit');
    const dailyProfitList = document.getElementById('dailyProfitList');
    const dateInput = document.getElementById('date'); // Add this line

    // Initialize chart data arrays
    let salesData = [];
    let purchaseData = [];
    let dailySales = [];
    let dailyPurchases = [];
    let dailyProfit = [];
    let cumulativeProfit = [];
    const labels = [];

    // Initialize Chart.js
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: salesData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderWidth: 2,
                fill: true
            }, {
                label: 'Purchases',
                data: purchaseData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            }
        }
    });

    const ctxProfit = document.getElementById('profitChart').getContext('2d');
    const profitChart = new Chart(ctxProfit, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Profit',
                data: cumulativeProfit,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Profit'
                    }
                }
            }
        }
    });

    // Show or hide form fields based on selection
    entryTypeSelect.addEventListener('change', () => {
        const value = entryTypeSelect.value;
        const showFields = (value === 'sale' || value === 'purchase');
        dateRow.classList.toggle('hidden', !showFields);
        amountRow.classList.toggle('hidden', !showFields);
        descriptionRow.classList.toggle('hidden', !showFields);
    });

    // Initialize date input to today's date

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    // Initial call to set visibility based on the default selected option
    entryTypeSelect.dispatchEvent(new Event('change'));

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const entryType = formData.get('entry-type');
        const amount = parseFloat(formData.get('amount'));
        const date = formData.get('date');
        const dateLabel = new Date(date).toLocaleDateString();
        const description = formData.get('description');

        const dataEntry = {
            entryType: entryType,
            date: date,
            amount: amount,
            description: description
        };

        // Save data to localStorage
        let entries = JSON.parse(localStorage.getItem('entries')) || [];
        entries.push(dataEntry);
        localStorage.setItem('entries', JSON.stringify(entries));


        // Initialize lists for income and expenses
        let incomeList = [];
        let expensesList = [];

        // Assume that each entry has an 'income' and 'expenses' field
        entries.forEach(entry => {
            if (entry.entryType === 'sale') {
                incomeList.push(entry.amount);
            }
            if (entry.entryType === 'purchase') {
                expensesList.push(entry.amount);
            }
        });

        // Send the collected data to the server
        fetch('http://127.0.0.1:5000/process_entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                income: incomeList,
                expenses: expensesList
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        if (entryType === 'sale') {
            if (!labels.includes(dateLabel)) {
                labels.push(dateLabel);
                salesData.push(amount);
                purchaseData.push(0);  // Placeholder for purchases
                dailySales.push(amount);
                dailyPurchases.push(0);
                dailyProfit.push(amount); // Daily profit for the new date
            } else {
                const index = labels.indexOf(dateLabel);
                salesData[index] += amount;
                dailySales[index] += amount; // Update daily sales
                dailyProfit[index] += amount; // Update daily profit
            }
        } else if (entryType === 'purchase') {
            if (!labels.includes(dateLabel)) {
                labels.push(dateLabel);
                salesData.push(0);  // Placeholder for sales
                purchaseData.push(amount);
                dailySales.push(0);
                dailyPurchases.push(amount); // Daily purchases for the new date
                dailyProfit.push(-amount); // Daily profit for the new date
            } else {
                const index = labels.indexOf(dateLabel);
                purchaseData[index] += amount;
                dailyPurchases[index] += amount; // Update daily purchases
                dailyProfit[index] -= amount; // Update daily profit
            }
        }

        // Calculate cumulative profit
        cumulativeProfit = dailyProfit.reduce((acc, profit, index) => {
            acc.push((acc[index - 1] || 0) + profit);
            return acc;
        }, []);

        // Calculate total profit
        const totalSales = salesData.reduce((a, b) => a + b, 0);
        const totalPurchases = purchaseData.reduce((a, b) => a + b, 0);
        const totalProfit = totalSales - totalPurchases;

        // Update the charts
        salesChart.data.labels = labels;
        salesChart.data.datasets[0].data = salesData;
        salesChart.data.datasets[1].data = purchaseData;
        salesChart.update();

        profitChart.data.labels = labels;
        profitChart.data.datasets[0].data = cumulativeProfit;
        profitChart.update();

        // Update daily profit list
        dailyProfitList.innerHTML = labels.map((label, index) => 
            `<li>${label}: Sales: $${dailySales[index].toFixed(2)}, Purchases: $${dailyPurchases[index].toFixed(2)}, Profit: $${dailyProfit[index].toFixed(2)}</li>`
        ).join('');

        // Update total profit display
        totalProfitElement.textContent = `Total Profit: $${totalProfit.toFixed(2)}`;

        // Optionally, clear the form fields
        form.reset();
        entryTypeSelect.dispatchEvent(new Event('change'));  // Re-trigger change event to hide fields
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    });

});
