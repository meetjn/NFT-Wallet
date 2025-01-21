"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceChartProps {
  pair: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ pair }) => {
  const [priceData, setPriceData] = useState<number[]>([]); // For storing the live prices
  const [timeLabels, setTimeLabels] = useState<string[]>([]); // For storing the time labels

  useEffect(() => {
    // Function to fetch live prices and update chart data
    const fetchLivePrices = async () => {
      const response = await fetch(`/api/live-prices?pairs=${pair}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const latestPrice = data[0].price.replace('$', '');
        const currentTime = new Date().toLocaleTimeString();
        setPriceData((prevData) => [...prevData, parseFloat(latestPrice)]);
        setTimeLabels((prevLabels) => [...prevLabels, currentTime]);
      }
    };

    const intervalId = setInterval(fetchLivePrices, 60000); 

    return () => clearInterval(intervalId); 
  }, [pair]);

  // Chart.js Data
  const data = {
    labels: timeLabels, // Time labels
    datasets: [
      {
        label: `${pair} Live Price`,
        data: priceData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  
  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'category' as const, 
      },
      y: {
        min: 0,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceChart;
