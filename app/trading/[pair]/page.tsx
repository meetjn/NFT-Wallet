"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import TradingChart from '../../../components/trading/TradingChart';
import { useParams } from 'next/navigation';
import styles from '../../../styles/TradingPair.module.css';

interface OrderValidation {
  isValid: boolean;
  message?: string;
}

const TradingPairPage = () => {
  const params = useParams();
  const pair = params.pair as string;
  
  const [baseCurrency, quoteCurrency] = pair ? pair.split('-') : ['', ''];
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState<OrderValidation>({ isValid: true });
  
  const [buyFormValues, setBuyFormValues] = useState({
    amount: '',
    takeProfit: '',
    stopLoss: '',
    potentialProfit: '0.00',
    maxLoss: '0.00'
  });

  const [sellFormValues, setSellFormValues] = useState({
    amount: '',
    takeProfit: '',
    stopLoss: '',
    potentialProfit: '0.00',
    maxLoss: '0.00'
  });

  const [activeTab, setActiveTab] = useState('buy');
  const [activePercent, setActivePercent] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`/api/price/${pair}`);
        const data = await response.json();
        setMarketPrice(data.price);
        const currentAmount = activeTab === 'buy' ? buyFormValues.amount : sellFormValues.amount;
        if (currentAmount) {
          setTotalPrice(data.price * Number(currentAmount));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 2000);
    return () => clearInterval(interval);
  }, [pair, activeTab, buyFormValues.amount, sellFormValues.amount]);

  const validateOrder = (type: 'buy' | 'sell', values: typeof buyFormValues): OrderValidation => {
    if (!marketPrice) return { isValid: false, message: 'Market price not available' };
    
    const tp = Number(values.takeProfit);
    const sl = Number(values.stopLoss);
    const amount = Number(values.amount);

    if (!amount || amount <= 0) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }

    if (type === 'buy') {
      if (tp && tp <= marketPrice) {
        return { isValid: false, message: 'Take profit must be higher than market price for buy orders' };
      }
      if (sl && sl >= marketPrice) {
        return { isValid: false, message: 'Stop loss must be lower than market price for buy orders' };
      }
    } else {
      if (tp && tp >= marketPrice) {
        return { isValid: false, message: 'Take profit must be lower than market price for sell orders' };
      }
      if (sl && sl <= marketPrice) {
        return { isValid: false, message: 'Stop loss must be higher than market price for sell orders' };
      }
    }

    return { isValid: true };
  };

  const calculateProfitLoss = (type: 'buy' | 'sell', values: typeof buyFormValues) => {
    if (!marketPrice || !values.amount) return;

    const amount = Number(values.amount);
    const tp = Number(values.takeProfit);
    const sl = Number(values.stopLoss);

    if (type === 'buy') {
      const potentialProfit = tp ? ((tp - marketPrice) * amount).toFixed(2) : '0.00';
      const maxLoss = sl ? ((marketPrice - sl) * amount).toFixed(2) : '0.00';
      return { potentialProfit, maxLoss };
    } else {
      const potentialProfit = tp ? ((marketPrice - tp) * amount).toFixed(2) : '0.00';
      const maxLoss = sl ? ((sl - marketPrice) * amount).toFixed(2) : '0.00';
      return { potentialProfit, maxLoss };
    }
  };

  const handleInputChange = (name: string, value: string, type: 'buy' | 'sell') => {
    const setFormValues = type === 'buy' ? setBuyFormValues : setSellFormValues;
    const currentValues = type === 'buy' ? buyFormValues : sellFormValues;
    
    const newValues = {
      ...currentValues,
      [name]: value
    };

    if (name === 'amount' && marketPrice) {
      const numAmount = Number(value) || 0;
      setTotalPrice(numAmount * marketPrice);
    }

    const profitLoss = calculateProfitLoss(type, newValues);
    if (profitLoss) {
      newValues.potentialProfit = profitLoss.potentialProfit;
      newValues.maxLoss = profitLoss.maxLoss;
    }

    setFormValues(newValues);
    setValidation(validateOrder(type, newValues));
  };

  const OrderForm = ({ type }: { type: 'buy' | 'sell' }) => {
    const formValues = type === 'buy' ? buyFormValues : sellFormValues;
    const buttonStyle = type === 'buy' ? styles.buyButton : styles.sellButton;

    return (
      <div className={styles.formContent}>
        {!validation.isValid && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{validation.message}</AlertDescription>
          </Alert>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Price per {baseCurrency}</label>
          <div className={styles.inputWrapper}>
            <Input
              type="text"
              value={isLoading ? 'Loading...' : (marketPrice?.toFixed(4) ?? '0.0000')}
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
              onChange={(e) => handleInputChange('amount', e.target.value, type)}
              placeholder="0.00"
              className={styles.input}
            />
            <span className={styles.inputSuffix}>{baseCurrency}</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Total Price</label>
          <div className={styles.inputWrapper}>
            <Input
              type="text"
              value={totalPrice ? totalPrice.toFixed(4) : '0.0000'}
              disabled={true}
              className={`${styles.input} ${styles.disabledInput}`}
            />
            <span className={styles.inputSuffix}>{quoteCurrency}</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Take Profit</label>
          <div className={styles.inputWrapper}>
            <Input
              type="text"
              value={formValues.takeProfit}
              onChange={(e) => handleInputChange('takeProfit', e.target.value, type)}
              placeholder="0.00"
              className={styles.input}
            />
            <span className={styles.inputSuffix}>{quoteCurrency}</span>
          </div>
          <div className={styles.profitIndicator}>
            Potential Profit: {formValues.potentialProfit} {quoteCurrency}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Stop Loss</label>
          <div className={styles.inputWrapper}>
            <Input
              type="text"
              value={formValues.stopLoss}
              onChange={(e) => handleInputChange('stopLoss', e.target.value, type)}
              placeholder="0.00"
              className={styles.input}
            />
            <span className={styles.inputSuffix}>{quoteCurrency}</span>
          </div>
          <div className={styles.lossIndicator}>
            Maximum Loss: {formValues.maxLoss} {quoteCurrency}
          </div>
        </div>
        {/*uncomment this to implement the % logic(currently not implemented)*/}
        {/* <div className={styles.percentageButtons}>
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => setActivePercent(percent)}
              className={`${styles.percentButton} ${activePercent === percent ? styles.active : ''}`}
            >
              {percent}%
            </button>
          ))}
        </div> */}

        <Button 
          className={`${styles.actionButton} ${buttonStyle}`}
          disabled={isLoading || !validation.isValid}
        >
          {type === 'buy' ? 'Buy' : 'Sell'} {baseCurrency}
        </Button>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.tradingLayout}>
        <div className={styles.chartSection}>
          {pair && <TradingChart symbol={pair} />}
        </div>

        <div className={styles.controls}>
          <Tabs defaultValue="buy" onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="buy" className={`${styles.tabsTrigger} ${styles.buyTab}`}>
                Buy {baseCurrency}
              </TabsTrigger>
              <TabsTrigger value="sell" className={`${styles.tabsTrigger} ${styles.sellTab}`}>
                Sell {baseCurrency}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy">
              <OrderForm type="buy" />
            </TabsContent>

            <TabsContent value="sell">
              <OrderForm type="sell" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TradingPairPage;