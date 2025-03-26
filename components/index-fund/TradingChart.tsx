"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import axios from "axios";

interface TradingChartProps {
    fundId: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ fundId }) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const seriesRef = useRef<ISeriesApi<"Line" | "Area" | "Candlestick"> | null>(null);
    const [selectedChartType, setSelectedChartType] = useState<"Line" | "Area" | "Candlestick">("Candlestick");
    const [selectedTimeframe, setSelectedTimeframe] = useState("1d");
    const [loading, setLoading] = useState(false);
    const [hoverData, setHoverData] = useState<{ time: string; price: string } | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            setIsDarkMode(false);
        } else {
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 450,
            layout: {
                background: { type: ColorType.Solid, color: isDarkMode ? "#111827" : "#ffffff" },
                textColor: isDarkMode ? "#F3F4F6" : "#111827",
            },
            grid: {
                vertLines: { color: isDarkMode ? "#374151" : "#E5E7EB" },
                horzLines: { color: isDarkMode ? "#374151" : "#E5E7EB" },
            },
            rightPriceScale: { borderColor: isDarkMode ? "#9ca3af" : "#D1D5DB" },
            timeScale: { borderColor: isDarkMode ? "#9ca3af" : "#D1D5DB", timeVisible: true },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [isDarkMode]);

    const updateSeries = () => {
        if (!chartRef.current) return;

        if (seriesRef.current) {
            try {
                chartRef.current.removeSeries(seriesRef.current);
            } catch (e) {
                console.warn("Series removal error:", e);
            }
            seriesRef.current = null;
        }

        let newSeries: ISeriesApi<"Line" | "Area" | "Candlestick"> | null = null;

        if (selectedChartType === "Area") {
            newSeries = chartRef.current.addAreaSeries({
                lineColor: "#22C55E",
                lineWidth: 2,
                topColor: "rgba(34, 197, 94, 0.4)",
                bottomColor: "rgba(34, 197, 94, 0.1)",
            });
        } else if (selectedChartType === "Candlestick") {
            newSeries = chartRef.current.addCandlestickSeries({
                upColor: "#10b981",
                downColor: "#ef4444",
                borderDownColor: "#ef4444",
                borderUpColor: "#10b981",
                wickDownColor: "#ef4444",
                wickUpColor: "#10b981",
            });
        } else {
            newSeries = chartRef.current.addLineSeries({
                color: "#3B82F6",
                lineWidth: 2,
            });
        }

        if (newSeries) {
            seriesRef.current = newSeries;
            fetchHistoricalData();
        }
    };

    useEffect(() => {
        updateSeries();
    }, [selectedChartType]);

    useEffect(() => {
        fetchHistoricalData();
    }, [selectedTimeframe]);

    const fetchHistoricalData = async () => {
        if (!seriesRef.current) return;
        setLoading(true);

        try {
            const response = await axios.get(`/api/index-fund/${fundId}/graph?timeframe=${selectedTimeframe}`);
            const historicalData = response.data.historicalData.map((entry: any) => ({
                time: entry.time as UTCTimestamp,
                open: entry.open,
                high: entry.high,
                low: entry.low,
                close: entry.close,
                value: entry.value, // For line and area charts
            }));

            if (selectedChartType === "Candlestick") {
                seriesRef.current.setData(historicalData);
            } else {
                const formattedData = historicalData.map((entry) => ({
                    time: entry.time,
                    value: entry.value ?? entry.close,
                }));
                seriesRef.current.setData(formattedData);
            }

            chartRef.current!.timeScale().fitContent();

            // ✅ Add Crosshair Move Event (Hover)
            chartRef.current?.subscribeCrosshairMove((param) => {
                if (param === undefined || param.time === undefined || !param.seriesData) {
                    setHoverData(null);
                    return;
                }

                const priceData = param.seriesData.get(seriesRef.current!);
                if (priceData) {
                    setHoverData({
                        time: new Date((param.time as number) * 1000).toLocaleString(),
                        price: (priceData.close ?? priceData.value)?.toFixed(2) || "N/A",
                    });
                }
            });

        } catch (error) {
            console.error("Error fetching historical data:", error);
        }

        setLoading(false);
    };

    return (
        <div className={`relative w-full max-w-5xl mx-auto ${isDarkMode ? "bg-gray-900" : "bg-white"} shadow-lg rounded-lg p-4`}>
            {/* Theme Toggle */}
            <button
                onClick={() => {
                    setIsDarkMode((prev) => {
                        localStorage.setItem("theme", prev ? "light" : "dark");
                        return !prev;
                    });
                }}
                className="absolute top-4 right-4 p-2 text-white bg-gray-700 rounded"
            >
                {isDarkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>

            {/* Dropdown for Timeframe & Chart Type */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                    >
                        <option value="1h">1 Hour</option>
                        <option value="1d">1 Day</option>
                        <option value="1w">1 Week</option>
                        <option value="1M">1 Month</option>
                        <option value="1y">1 Year</option>
                    </select>

                    <select
                        value={selectedChartType}
                        onChange={(e) => setSelectedChartType(e.target.value as "Line" | "Area" | "Candlestick")}
                        className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                    >
                        <option value="Line">Line Chart</option>
                        <option value="Area">Area Chart</option>
                        <option value="Candlestick">Candlestick Chart</option>
                    </select>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="w-full h-96 rounded-lg overflow-hidden border border-gray-700" />

            {/* Hover Details Tooltip */}
            {hoverData && (
                <div className="absolute top-4 left-4 bg-gray-800 text-white p-2 rounded shadow-lg">
                    <p>🕒 Time: {hoverData.time}</p>
                    <p>💲 Price: ${hoverData.price}</p>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && <div className="text-gray-300 text-lg text-center">Loading...</div>}
        </div>
    );
};

export default TradingChart;
