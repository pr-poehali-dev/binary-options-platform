import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import CandlestickChart from '@/components/CandlestickChart';

type Trade = {
  id: string;
  asset: string;
  direction: 'up' | 'down';
  amount: number;
  openPrice: number;
  closePrice?: number;
  result?: 'win' | 'loss';
  payout?: number;
  timestamp: Date;
};

type ChartDataPoint = {
  time: string;
  price: number;
};

type CandleData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

const Index = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [balance, setBalance] = useState(10000);
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [tradeAmount, setTradeAmount] = useState(100);
  const [activeSection, setActiveSection] = useState('trading');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [chartType, setChartType] = useState<'area' | 'candle'>('candle');

  const assets = [
    { value: 'BTC/USD', label: 'Bitcoin / USD', emoji: '₿' },
    { value: 'ETH/USD', label: 'Ethereum / USD', emoji: 'Ξ' },
    { value: 'EUR/USD', label: 'Euro / USD', emoji: '€' },
    { value: 'GBP/USD', label: 'Pound / USD', emoji: '£' },
  ];

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h'];

  useEffect(() => {
    const basePrice = selectedAsset === 'BTC/USD' ? 43500 : selectedAsset === 'ETH/USD' ? 2300 : 1.08;
    const initialData: ChartDataPoint[] = [];
    const initialCandles: CandleData[] = [];
    let price = basePrice;
    
    for (let i = 60; i >= 0; i--) {
      const volatility = basePrice * 0.002;
      price = price + (Math.random() - 0.5) * volatility;
      initialData.push({
        time: `${i}s`,
        price: parseFloat(price.toFixed(2))
      });
    }
    
    for (let i = 0; i < 30; i++) {
      const open = price;
      const volatility = basePrice * 0.003;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      initialCandles.push({
        time: `${30 - i}m`,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      price = close;
    }
    
    setChartData(initialData);
    setCandleData(initialCandles);
    setCurrentPrice(initialData[initialData.length - 1].price);

    const interval = setInterval(() => {
      setChartData(prev => {
        const lastPrice = prev[prev.length - 1].price;
        const volatility = basePrice * 0.002;
        const newPrice = lastPrice + (Math.random() - 0.5) * volatility;
        
        const newData = [...prev.slice(1), {
          time: '0s',
          price: parseFloat(newPrice.toFixed(2))
        }];
        
        setCurrentPrice(newPrice);
        return newData;
      });
      
      setCandleData(prev => {
        if (prev.length === 0) return prev;
        const lastCandle = prev[prev.length - 1];
        const volatility = basePrice * 0.003;
        const close = lastCandle.close + (Math.random() - 0.5) * volatility * 0.3;
        
        const updatedCandle = {
          ...lastCandle,
          close: parseFloat(close.toFixed(2)),
          high: Math.max(lastCandle.high, close),
          low: Math.min(lastCandle.low, close)
        };
        
        return [...prev.slice(0, -1), updatedCandle];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  useEffect(() => {
    const checkActiveTrades = setInterval(() => {
      const now = Date.now();
      setActiveTrades(prev => {
        const stillActive = prev.filter(trade => {
          const elapsed = now - trade.timestamp.getTime();
          if (elapsed >= 60000) {
            const result: Trade = {
              ...trade,
              closePrice: currentPrice,
              result: Math.random() > 0.45 ? 'win' : 'loss',
              payout: 0
            };
            result.payout = result.result === 'win' ? trade.amount * 1.85 : 0;
            
            setTrades(t => [result, ...t]);
            setBalance(b => b + result.payout);
            return false;
          }
          return true;
        });
        return stillActive;
      });
    }, 1000);

    return () => clearInterval(checkActiveTrades);
  }, [currentPrice]);

  const handleTrade = (direction: 'up' | 'down') => {
    if (tradeAmount > balance) {
      return;
    }

    const newTrade: Trade = {
      id: Math.random().toString(36),
      asset: selectedAsset,
      direction,
      amount: tradeAmount,
      openPrice: currentPrice,
      timestamp: new Date()
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setBalance(b => b - tradeAmount);
  };

  const sidebarItems = [
    { id: 'trading', label: 'Трейдинг', icon: 'TrendingUp' },
    { id: 'portfolio', label: 'Портфель', icon: 'Wallet' },
    { id: 'history', label: 'История', icon: 'History' },
    { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'support', label: 'Поддержка', icon: 'MessageCircle' },
    { id: 'education', label: 'Обучение', icon: 'BookOpen' },
  ];

  const winRate = trades.length > 0 
    ? ((trades.filter(t => t.result === 'win').length / trades.length) * 100).toFixed(1)
    : '0.0';

  const totalInvested = trades.reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = trades.reduce((sum, t) => sum + (t.payout ? t.payout - t.amount : -t.amount), 0);
  const wonTrades = trades.filter(t => t.result === 'win').length;
  const lostTrades = trades.filter(t => t.result === 'loss').length;

  const assetStats = assets.map(asset => {
    const assetTrades = trades.filter(t => t.asset === asset.value);
    const wins = assetTrades.filter(t => t.result === 'win').length;
    const total = assetTrades.length;
    return {
      asset: asset.value,
      emoji: asset.emoji,
      total,
      wins,
      losses: total - wins,
      winRate: total > 0 ? ((wins / total) * 100).toFixed(1) : '0',
      profit: assetTrades.reduce((sum, t) => sum + (t.payout ? t.payout - t.amount : -t.amount), 0)
    };
  });

  const balanceHistory = [
    { time: 'Старт', balance: 10000 },
    ...trades.map((trade, idx) => ({
      time: `${idx + 1}`,
      balance: 10000 + trades.slice(0, idx + 1).reduce((sum, t) => sum + (t.payout ? t.payout - t.amount : -t.amount), 0)
    }))
  ].slice(-20);

  return (
    <div className="min-h-screen bg-background dark flex">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Icon name="TrendingUp" size={28} className="text-sidebar-primary" />
            Fedlaxes
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon name={item.icon as any} size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="demo-mode" className="text-sm text-sidebar-foreground">
              {isDemoMode ? 'Демо-счёт' : 'Реальный счёт'}
            </Label>
            <Switch
              id="demo-mode"
              checked={isDemoMode}
              onCheckedChange={setIsDemoMode}
            />
          </div>
          <div className="bg-sidebar-accent rounded-lg p-4">
            <p className="text-xs text-sidebar-foreground/70 mb-1">Баланс</p>
            <p className="text-2xl font-bold text-sidebar-foreground">${balance.toFixed(2)}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map(asset => (
                  <SelectItem key={asset.value} value={asset.value}>
                    <span className="flex items-center gap-2">
                      <span>{asset.emoji}</span>
                      {asset.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
              <Badge variant={chartData.length > 1 && chartData[chartData.length - 1].price > chartData[chartData.length - 2].price ? 'default' : 'destructive'}>
                <Icon name={chartData.length > 1 && chartData[chartData.length - 1].price > chartData[chartData.length - 2].price ? 'TrendingUp' : 'TrendingDown'} size={14} />
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={chartType === 'candle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('candle')}
              >
                <Icon name="CandlestickChart" size={16} />
                Свечи
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                <Icon name="LineChart" size={16} />
                Линейный
              </Button>
            </div>
            <div className="flex gap-2">
              {timeframes.map(tf => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {activeSection === 'trading' && (
          <div className="flex-1 grid grid-cols-3 gap-4 p-6 overflow-auto">
            <div className="col-span-2 space-y-4">
              <Card className="p-6">
                {chartType === 'candle' ? (
                  <CandlestickChart 
                    data={candleData} 
                    width={800} 
                    height={400}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>

              {activeTrades.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="Activity" size={20} />
                    Активные сделки
                  </h3>
                  <div className="space-y-3">
                    {activeTrades.map(trade => {
                      const elapsed = Date.now() - trade.timestamp.getTime();
                      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
                      
                      return (
                        <div key={trade.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant={trade.direction === 'up' ? 'default' : 'destructive'}>
                              <Icon name={trade.direction === 'up' ? 'ArrowUp' : 'ArrowDown'} size={14} />
                              {trade.direction === 'up' ? 'ВВЕРХ' : 'ВНИЗ'}
                            </Badge>
                            <div>
                              <p className="font-semibold">{trade.asset}</p>
                              <p className="text-sm text-muted-foreground">${trade.amount}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Осталось</p>
                            <p className="text-lg font-bold">{remaining}s</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Торговая панель</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Сумма ставки</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))}
                      >
                        -10
                      </Button>
                      <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(Number(e.target.value))}
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-center font-semibold"
                        min="10"
                        max={balance}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTradeAmount(Math.min(balance, tradeAmount + 10))}
                      >
                        +10
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[50, 100, 250, 500].map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setTradeAmount(Math.min(balance, amount))}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-success hover:bg-success/90 text-success-foreground h-14 text-lg font-semibold"
                      onClick={() => handleTrade('up')}
                      disabled={tradeAmount > balance}
                    >
                      <Icon name="ArrowUp" size={20} />
                      ВВЕРХ
                    </Button>
                    <Button 
                      className="w-full bg-destructive hover:bg-destructive/90 h-14 text-lg font-semibold"
                      onClick={() => handleTrade('down')}
                      disabled={tradeAmount > balance}
                    >
                      <Icon name="ArrowDown" size={20} />
                      ВНИЗ
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Выплата при победе</span>
                      <span className="font-semibold text-success">${(tradeAmount * 1.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Прибыль</span>
                      <span className="font-semibold text-success">+${(tradeAmount * 0.85).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Статистика</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Всего сделок</span>
                    <span className="font-semibold">{trades.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Процент побед</span>
                    <span className="font-semibold text-success">{winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Прибыль за сессию</span>
                    <span className={`font-semibold ${balance >= 10000 ? 'text-success' : 'text-destructive'}`}>
                      {balance >= 10000 ? '+' : ''}{(balance - 10000).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="flex-1 p-6 overflow-auto">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="History" size={24} />
                История сделок
              </h2>
              
              {trades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="TrendingUp" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Пока нет завершённых сделок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.map(trade => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant={trade.direction === 'up' ? 'default' : 'destructive'}>
                          <Icon name={trade.direction === 'up' ? 'ArrowUp' : 'ArrowDown'} size={14} />
                        </Badge>
                        <div>
                          <p className="font-semibold">{trade.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Ставка</p>
                          <p className="font-semibold">${trade.amount}</p>
                        </div>
                        <div>
                          <Badge variant={trade.result === 'win' ? 'default' : 'destructive'}>
                            {trade.result === 'win' ? 'Победа' : 'Проигрыш'}
                          </Badge>
                          <p className={`font-bold mt-1 ${trade.result === 'win' ? 'text-success' : 'text-destructive'}`}>
                            {trade.result === 'win' ? '+' : ''}{trade.payout ? (trade.payout - trade.amount).toFixed(2) : `-${trade.amount.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeSection === 'portfolio' && (
          <div className="flex-1 p-6 overflow-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="Wallet" size={24} />
              Портфель
            </h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Баланс</p>
                  <Icon name="Wallet" size={20} className="text-primary" />
                </div>
                <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${balance >= 10000 ? 'text-success' : 'text-destructive'}`}>
                  {balance >= 10000 ? '+' : ''}{((balance - 10000) / 10000 * 100).toFixed(2)}%
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Общая прибыль</p>
                  <Icon name="TrendingUp" size={20} className="text-success" />
                </div>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </p>
                <p className="text-sm mt-1 text-muted-foreground">
                  Всего инвестировано: ${totalInvested.toFixed(2)}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Успешных сделок</p>
                  <Icon name="CheckCircle2" size={20} className="text-success" />
                </div>
                <p className="text-3xl font-bold text-success">{wonTrades}</p>
                <p className="text-sm mt-1 text-muted-foreground">
                  Процент побед: {winRate}%
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Проигранных сделок</p>
                  <Icon name="XCircle" size={20} className="text-destructive" />
                </div>
                <p className="text-3xl font-bold text-destructive">{lostTrades}</p>
                <p className="text-sm mt-1 text-muted-foreground">
                  Всего сделок: {trades.length}
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="LineChart" size={20} />
                  График баланса
                </h3>
                {balanceHistory.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Icon name="LineChart" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Совершите сделки для отображения графика</p>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="PieChart" size={20} />
                  Соотношение результатов
                </h3>
                {trades.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Победы', value: wonTrades, color: 'hsl(var(--success))' },
                          { name: 'Проигрыши', value: lostTrades, color: 'hsl(var(--destructive))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="hsl(var(--success))" />
                        <Cell fill="hsl(var(--destructive))" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Icon name="PieChart" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Нет данных для отображения</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={20} />
                Статистика по активам
              </h3>
              {assetStats.some(a => a.total > 0) ? (
                <div className="space-y-4">
                  {assetStats.filter(a => a.total > 0).map(stat => (
                    <div key={stat.asset} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{stat.emoji}</span>
                          <div>
                            <p className="font-semibold text-lg">{stat.asset}</p>
                            <p className="text-sm text-muted-foreground">
                              {stat.total} {stat.total === 1 ? 'сделка' : stat.total < 5 ? 'сделки' : 'сделок'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${stat.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {stat.profit >= 0 ? '+' : ''}${stat.profit.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">Прибыль</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{stat.wins}</p>
                          <p className="text-xs text-muted-foreground">Побед</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">{stat.losses}</p>
                          <p className="text-xs text-muted-foreground">Проигрышей</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{stat.winRate}%</p>
                          <p className="text-xs text-muted-foreground">Процент побед</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="BarChart3" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Начните торговать для отображения статистики</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeSection !== 'trading' && activeSection !== 'history' && activeSection !== 'portfolio' && (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Construction" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">В разработке</h2>
              <p className="text-muted-foreground">Раздел "{sidebarItems.find(s => s.id === activeSection)?.label}" скоро появится</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;