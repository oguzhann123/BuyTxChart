import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App = () => {
  const address = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
  const [data, setData] = useState({});
  const [totalAmount, setTotalAmount] = useState(0); // total buy amount purchase

  useEffect(() => {
    const fetchTransactions = async () => {
      const apiKey = "YOUR_API_KEY";  //  enter a API KEY
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

      try {
        const response = await axios.get(url);
        const transactions = response.data.result;

        const buyTransactions = transactions
          .filter(tx => tx.to.toLowerCase() === address.toLowerCase()) // target buy transactions
          .map(tx => ({
            time: new Date(tx.timeStamp * 1000),
            amount: parseFloat(tx.value) / (10 ** tx.tokenDecimal),
            hash: tx.hash, 
            blockNumber: tx.blockNumber, 
          }));

        const startDate = new Date("2024-01-01");  // to generate date
        const filteredTransactions = buyTransactions
          .filter(tx => tx.time >= startDate);

        const dates = filteredTransactions.map(tx => tx.time.toLocaleDateString());
        const amounts = filteredTransactions.map(tx => tx.amount);

        // Toplam alım miktarını hesapla
        const total = amounts.reduce((acc, curr) => acc + curr, 0);
        setTotalAmount(total);

        setData({
          labels: dates,
          datasets: [
            {
              label: 'DEGEn Buy Transaction',
              data: amounts,
              borderColor: 'rgb(239, 71, 111)',
              backgroundColor: 'rgba(239, 71, 111, 0.4)',
              borderWidth: 3,
              tension: 0.5,
              pointRadius: 8,
              pointBackgroundColor: 'rgb(239, 71, 111)',
              pointHoverRadius: 12,
              pointHoverBackgroundColor: 'rgb(239, 71, 111)',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 3,
              pointStyle: 'circle',
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 60000); // refresh every min to update data

    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="app-container">
      <h1 className="title">DEGEn Buy Transaction</h1>
      <div className="total-amount">
        <p>Total Amount Purchased: {totalAmount.toFixed(2)} DEGEN</p> {/* total Amount purchased */}
      </div>
      <div className="chart-container">
        {data.labels ? <Line data={data} options={{
          animation: {
            duration: 2000,
            easing: 'easeInOutCubic',
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#fff',
                font: { size: 16 },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.raw;
                  return `Amount: ${value.toFixed(2)} DEGEN`; // we added DEGEN amount in Tooltip
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              grid: { color: '#34495e' },
            },
            y: {
              ticks: { color: '#fff' },
              grid: { color: '#34495e' },
            },
          },
          elements: {
            point: {
              hoverBackgroundColor: function(ctx) {
                return ctx.raw > 1000 ? 'yellow' : 'rgb(239, 71, 111)'; // hover color for High intakes
              },
            },
          },
        }} /> : <p>Loading transaction data...</p>}
      </div>
    </div>
  );
};

export default App;
