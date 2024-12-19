"use client";

import React, { useRef, useEffect } from "react";

interface TradingGraphProps {
  pair: string;
}

const TradingGraph: React.FC<TradingGraphProps> = ({ pair }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure chartRef.current is not null before using it
    if (chartRef.current && typeof window !== "undefined" && window.TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js"; // TradingView widget library URL
      script.async = true;
      script.onload = () => {
        new window.TradingView.widget({
          autosize: true,
          symbol: pair, // Dynamically set the symbol for the selected pair
          interval: "60", // 1-hour chart
          container_id: chartRef.current ? chartRef.current.id : "",
          datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
          library_path: "https://s3.tradingview.com/library/",
          locale: "en",
          enabled_features: ["study_templates", "hide_last_na", "remove_library_container"],
          disabled_features: ["header_widget", "header_symbol_search"],
        });
      };
      document.body.appendChild(script); // Append the script to the body
    }
  }, [pair]); // Re-run when 'pair' changes

  return <div ref={chartRef} id="tradingview-chart" style={{ width: "100%", height: "500px" }} />;
};

export default TradingGraph;

// "use client"; // Ensure this is client-side code

// import React, { useRef, useEffect } from "react";

// interface TradingGraphProps {
//   pair: string;
// }

// const TradingGraph: React.FC<TradingGraphProps> = ({ pair }) => {
//   const chartRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     // Ensure we are running on the client-side
//     if (typeof window !== "undefined" && window.TradingView) {
//       const script = document.createElement("script");
//       script.src = "https://s3.tradingview.com/tv.js"; // TradingView widget library URL
//       script.async = true;
//       script.onload = () => {
//         if (chartRef.current) {
//           new window.TradingView.widget({
//             autosize: true,
//             symbol: pair,
//             interval: "60", // 1-hour chart
//             container_id: chartRef.current.id,
//             datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
//             library_path: "https://s3.tradingview.com/library/",
//             locale: "en",
//             enabled_features: ["study_templates", "hide_last_na", "remove_library_container"],
//             disabled_features: ["header_widget", "header_symbol_search"],
//           });
//         }
//       };
//       document.body.appendChild(script); // Append the script to the body
//     }
//   }, [pair]); // Re-run when 'pair' changes

//   return <div ref={chartRef} id="tradingview-chart" style={{ width: "100%", height: "500px" }} />;
// };

// export default TradingGraph;
