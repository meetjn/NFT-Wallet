


"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TradingChart from '../../../components/trading/TradingChart';
import { useParams } from 'next/navigation';
import styles from '../../../styles/TradingPair.module.css';

const TradingPairPage = () => {
  const params = useParams();
  const pair = params.pair as string;
  
  // Split the pair into base and quote currencies
  const [baseCurrency, quoteCurrency] = pair ? pair.split('-') : ['', ''];
  
  const [marketPrice, setMarketPrice] = useState(7.03);
  
  const [formValues, setFormValues] = useState({
    price: marketPrice.toString(),
    amount: '',
    takeProfit: '',
    stopLoss: ''
  });

  const [activePercent, setActivePercent] = useState<number | null>(null);

  const calculateUSDTValue = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return '0.00';
    return (Number(amount) * marketPrice).toFixed(2);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'amount' && {
        price: calculateUSDTValue(value)
      })
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.tradingLayout}>
        <div className={styles.chartSection}>
          {pair && <TradingChart symbol={pair} />}
        </div>

        <div className={styles.controls}>
          <Tabs defaultValue="buy">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="buy" className={`${styles.tabsTrigger} ${styles.buyTab}`}>
                Buy {baseCurrency}
              </TabsTrigger>
              <TabsTrigger value="sell" className={`${styles.tabsTrigger} ${styles.sellTab}`}>
                Sell {baseCurrency}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className={styles.formContent}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Price</label>
                <div className={styles.inputWrapper}>
                  <Input
                    type="text"
                    value={formValues.price}
                    disabled={true}
                    className={`${styles.input} ${styles.disabledInput}`}
                  />
                  <span className={styles.inputSuffix}>{quoteCurrency}</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Amount</label>
                <div className={styles.inputWrapper}>
                  <Input
                    type="text"
                    value={formValues.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className={styles.input}
                  />
                  <span className={styles.inputSuffix}>{baseCurrency}</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Take Profit</label>
                <div className={styles.inputWrapper}>
                  <Input
                    type="text"
                    value={formValues.takeProfit}
                    onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                    placeholder="0.00"
                    className={styles.input}
                  />
                  <span className={styles.inputSuffix}>{quoteCurrency}</span>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Stop Loss</label>
                <div className={styles.inputWrapper}>
                  <Input
                    type="text"
                    value={formValues.stopLoss}
                    onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    placeholder="0.00"
                    className={styles.input}
                  />
                  <span className={styles.inputSuffix}>{quoteCurrency}</span>
                </div>
              </div>

              <div className={styles.percentageButtons}>
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setActivePercent(percent)}
                    className={`${styles.percentButton} ${activePercent === percent ? styles.active : ''}`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              <Button className={`${styles.actionButton} ${styles.buyButton}`}>
                Buy {baseCurrency}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TradingPairPage;