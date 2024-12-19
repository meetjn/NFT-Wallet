import { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import styles from '../../styles/TradingChart.module.css';

const TradingChart = ({ symbol }: { symbol: string }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>();
  const [activeTimeframe, setActiveTimeframe] = useState('1H');

  useEffect(() => {
    if (!chartContainerRef.current || !symbol) return;

    const formattedSymbol = symbol.replace('-', '');
    
    const chartProperties = {
      width: chartContainerRef.current.clientWidth,
      height: 360, // Reduced height to fit container
      layout: {
        background: { color: '#1E2026' },
        textColor: '#848E9C',
      },
      grid: {
        vertLines: { color: '#2A2E37' },
        horzLines: { color: '#2A2E37' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2A2E37',
      },
      rightPriceScale: {
        borderColor: '#2A2E37',
      },
    };

    const chart = createChart(chartContainerRef.current, chartProperties);
    
    // Make chart responsive
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00C087',
      downColor: '#CF304A',
      borderVisible: false,
      wickUpColor: '#00C087',
      wickDownColor: '#CF304A',
    });
    candleSeriesRef.current = candleSeries;

    // Rest of your existing fetch and data handling code remains the same
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/klines?symbol=${formattedSymbol}&interval=1m&limit=1000`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const cdata = data.map((d: any) => ({
          time: (d[0] / 1000) as Time,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        
        candleSeries.setData(cdata);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    const fetchLatestCandle = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/klines?symbol=${formattedSymbol}&interval=1m&limit=1`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data && data[0]) {
          const latestCandle: CandlestickData = {
            time: (data[0][0] / 1000) as Time,
            open: parseFloat(data[0][1]),
            high: parseFloat(data[0][2]),
            low: parseFloat(data[0][3]),
            close: parseFloat(data[0][4]),
          };
          
          candleSeries.update(latestCandle);
        }
      } catch (error) {
        console.error('Error fetching latest candle:', error);
      }
    };

    fetchHistoricalData();
    const intervalId = setInterval(fetchLatestCandle, 1000);

    return () => {
      clearInterval(intervalId);
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [symbol]);

  const timeframes = ['1m', '5m', '15m', '30m', '1H', '2H', '6H', '1D', '1W'];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <div className={styles.symbolInfo}>
          <span className={styles.symbolName}>{symbol}</span>
          <span className={styles.price}>0.00028</span>
        </div>
        <div className={styles.timeframes}>
          {timeframes.map((tf) => (
            <span
              key={tf}
              className={`${styles.timeframe} ${tf === activeTimeframe ? styles.timeframeActive : ''}`}
              onClick={() => setActiveTimeframe(tf)}
            >
              {tf}
            </span>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className={styles.chartWrapper} />
    </div>
  );
};

export default TradingChart;

