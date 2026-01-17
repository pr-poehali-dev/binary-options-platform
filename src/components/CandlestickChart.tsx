import { useMemo } from 'react';

type CandleData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface CandlestickChartProps {
  data: CandleData[];
  width: number;
  height: number;
}

const CandlestickChart = ({ data, width, height }: CandlestickChartProps) => {
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    
    const allPrices = data.flatMap(d => [d.low, d.high]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const range = max - min;
    const padding = range * 0.1;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: range + (padding * 2)
    };
  }, [data]);

  const candleWidth = useMemo(() => {
    return Math.max(4, Math.min(20, (width - 80) / data.length - 4));
  }, [width, data.length]);

  const priceToY = (price: number) => {
    const chartHeight = height - 60;
    return 30 + (chartHeight * (1 - (price - minPrice) / priceRange));
  };

  const gridLines = useMemo(() => {
    const lines = [];
    const step = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (step * i);
      lines.push({
        y: priceToY(price),
        price: price.toFixed(2)
      });
    }
    return lines;
  }, [minPrice, priceRange, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className="bg-card">
      <defs>
        <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {gridLines.map((line, i) => (
        <g key={i}>
          <line
            x1={60}
            y1={line.y}
            x2={width - 20}
            y2={line.y}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.3"
          />
          <text
            x={width - 15}
            y={line.y + 4}
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
            textAnchor="end"
          >
            {line.price}
          </text>
        </g>
      ))}

      {data.map((candle, i) => {
        const x = 70 + (i * (candleWidth + 4));
        const openY = priceToY(candle.open);
        const closeY = priceToY(candle.close);
        const highY = priceToY(candle.high);
        const lowY = priceToY(candle.low);
        
        const isGreen = candle.close >= candle.open;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);
        const color = isGreen ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

        return (
          <g key={i}>
            <line
              x1={x + candleWidth / 2}
              y1={highY}
              x2={x + candleWidth / 2}
              y2={lowY}
              stroke={color}
              strokeWidth="1.5"
            />
            <rect
              x={x}
              y={bodyTop}
              width={candleWidth}
              height={Math.max(bodyHeight, 1)}
              fill={isGreen ? color : 'transparent'}
              stroke={color}
              strokeWidth="1.5"
              rx="1"
            />
            {i % Math.max(1, Math.floor(data.length / 10)) === 0 && (
              <text
                x={x + candleWidth / 2}
                y={height - 10}
                fontSize="10"
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
              >
                {candle.time}
              </text>
            )}
          </g>
        );
      })}

      <line
        x1={60}
        y1={30}
        x2={60}
        y2={height - 30}
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
      <line
        x1={60}
        y1={height - 30}
        x2={width - 20}
        y2={height - 30}
        stroke="hsl(var(--border))"
        strokeWidth="2"
      />
    </svg>
  );
};

export default CandlestickChart;
