import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Sparkles, Zap, TrendingUpIcon } from 'lucide-react';

const ModernCryptoDashboard = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [timeRange, setTimeRange] = useState('7');
  const [currency, setCurrency] = useState('usd');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#34d399'];
  const GRADIENT_COLORS = [
    'from-blue-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-pink-500 to-orange-600',
    'from-orange-500 to-yellow-600',
    'from-green-500 to-emerald-600'
  ];

  const fetchCryptoData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h,7d`
      );
      
      if (!response.ok) throw new Error('Error al obtener datos');
      
      const data = await response.json();
      setCryptoData(data);
      setLoading(false);
    } catch (err) {
      setError('No se pudieron cargar los datos. Por favor, intenta de nuevo.');
      console.error('Error fetching crypto data:', err);
      setLoading(false);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=${currency}&days=${timeRange}`
      );
      
      if (!response.ok) throw new Error('Error al obtener datos históricos');
      
      const data = await response.json();
      
      const formattedData = data.prices.map((price, index) => ({
        date: new Date(price[0]).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        price: parseFloat(price[1].toFixed(2)),
        volume: data.total_volumes[index] ? parseFloat((data.total_volumes[index][1] / 1000000).toFixed(2)) : 0
      }));

      const sampledData = timeRange === '365' 
        ? formattedData.filter((_, i) => i % 7 === 0)
        : timeRange === '30'
        ? formattedData.filter((_, i) => i % 2 === 0)
        : formattedData;

      setHistoricalData(sampledData);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, [currency]);

  useEffect(() => {
    if (selectedCrypto) {
      fetchHistoricalData();
    }
  }, [selectedCrypto, timeRange, currency]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-MX', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl shadow-2xl shadow-blue-500/20 animate-fadeIn">
          <p className="text-gray-300 text-sm mb-2 font-semibold">{label}</p>
          <p className="text-blue-400 font-bold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-purple-400 text-sm mt-1">
              Volumen: ${payload[1].value}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading && cryptoData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center overflow-hidden relative">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="text-center z-10">
          <div className="relative">
            <RefreshCw className="w-20 h-20 text-blue-400 animate-spin mx-auto mb-6" />
            <Sparkles className="w-8 h-8 text-purple-400 absolute -top-2 -right-2 animate-ping" />
          </div>
          <p className="text-gray-200 text-2xl font-bold animate-pulse">Cargando datos del mercado...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo información en tiempo real</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 backdrop-blur-xl border border-red-500/50 rounded-3xl p-8 max-w-md shadow-2xl shadow-red-500/20 animate-fadeIn">
          <div className="text-red-400 text-6xl mb-4 text-center">⚠️</div>
          <p className="text-red-300 text-center mb-6 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchCryptoData}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-2xl transition-all duration-300 font-bold shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 hover:scale-105"
            aria-label="Reintentar carga de datos"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-8 animate-slideDown">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/50 animate-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                    Crypto Dashboard
                  </h1>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Datos en tiempo real del mercado
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchCryptoData}
              disabled={isRefreshing}
              className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl transition-all duration-300 self-start md:self-auto shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="font-bold">Actualizar</span>
            </button>
          </div>
        </header>

        {/* Filters */}
        <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 border border-white/10 shadow-2xl animate-slideUp hover:border-white/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crypto Select */}
            <div className="group relative">
              <label htmlFor="crypto-select" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-400" />
                </div>
                Criptomoneda
              </label>
              <div className="relative">
                <select
                  id="crypto-select"
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-white/10 hover:border-blue-500/50 cursor-pointer font-medium appearance-none"
                  aria-label="Seleccionar criptomoneda"
                >
                  {cryptoData.map((crypto) => (
                    <option key={crypto.id} value={crypto.id} className="bg-gray-900 text-white">
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Time Range Select */}
            <div className="group relative">
              <label htmlFor="timerange-select" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                Período de Tiempo
              </label>
              <div className="relative">
                <select
                  id="timerange-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-purple-500/30 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 cursor-pointer font-medium appearance-none"
                  aria-label="Seleccionar rango de tiempo"
                >
                  <option value="1" className="bg-gray-900 text-white">24 Horas</option>
                  <option value="7" className="bg-gray-900 text-white">7 Días</option>
                  <option value="30" className="bg-gray-900 text-white">30 Días</option>
                  <option value="365" className="bg-gray-900 text-white">1 Año</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Currency Select */}
            <div className="group relative">
              <label htmlFor="currency-select" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <div className="p-1.5 bg-pink-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                </div>
                Moneda
              </label>
              <div className="relative">
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-sm border-2 border-pink-500/30 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 hover:bg-white/10 hover:border-pink-500/50 cursor-pointer font-medium appearance-none"
                  aria-label="Seleccionar moneda"
                >
                  <option value="usd" className="bg-gray-900 text-white">USD - Dólar</option>
                  <option value="eur" className="bg-gray-900 text-white">EUR - Euro</option>
                  <option value="mxn" className="bg-gray-900 text-white">MXN - Peso Mexicano</option>
                  <option value="btc" className="bg-gray-900 text-white">BTC - Bitcoin</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cryptoData.slice(0, 4).map((crypto, index) => {
            const isPositive = crypto.price_change_percentage_24h > 0;
            const isSelected = selectedCrypto === crypto.id;
            
            return (
              <article
                key={crypto.id}
                className={`group relative bg-gradient-to-br ${GRADIENT_COLORS[index]} p-[2px] rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1 animate-slideUp`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedCrypto(crypto.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setSelectedCrypto(crypto.id)}
                aria-label={`Ver detalles de ${crypto.name}`}
              >
                <div className={`bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 h-full transition-all duration-300 ${isSelected ? 'bg-gray-900/80' : ''}`}>
                  {/* Glow effect on selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl animate-pulse"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={crypto.image} 
                            alt={`Logo de ${crypto.name}`} 
                            className="w-12 h-12 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300" 
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-ping"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{crypto.symbol.toUpperCase()}</h3>
                          <p className="text-gray-400 text-xs">{crypto.name}</p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {isPositive ? (
                          <TrendingUp className="w-6 h-6 text-green-400" aria-label="Tendencia alcista" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-400" aria-label="Tendencia bajista" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-3xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                        {formatCurrency(crypto.current_price)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          isPositive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}
                          {crypto.price_change_percentage_24h?.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-500">24h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Area Chart - Price History */}
          <section className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-700/50 shadow-2xl hover:border-blue-500/50 transition-all duration-500 animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Histórico de Precio</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#60a5fa" 
                  strokeWidth={3}
                  fill="url(#colorPrice)"
                  name="Precio"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          {/* Bar Chart - Volume */}
          <section className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-700/50 shadow-2xl hover:border-purple-500/50 transition-all duration-500 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Volumen (Millones)</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="volume" 
                  fill="url(#colorVolume)"
                  name="Volumen"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                >
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Market Cap Pie Chart */}
        <section className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-gray-700/50 shadow-2xl hover:border-pink-500/50 transition-all duration-500 animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <TrendingUpIcon className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Distribución de Market Cap</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={cryptoData}
                  dataKey="market_cap"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  label={({ name, percent }) => `${name.slice(0, 3)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  animationDuration={1500}
                >
                  {cryptoData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '1rem',
                    backdropFilter: 'blur(20px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="space-y-3">
              {cryptoData.map((crypto, index) => (
                <div 
                  key={crypto.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCrypto(crypto.id)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full group-hover:scale-125 transition-transform duration-300"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                    <span className="text-white font-semibold">{crypto.name}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-sm">
                    {formatCurrency(crypto.market_cap)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center space-y-3 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <p className="text-sm">Datos proporcionados por CoinGecko API</p>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-sm">Actualizado en tiempo real</p>
          </div>
          <p className="text-gray-500 text-xs">
            Desarrollado React Native - Prueba Técnica Front-End 
          </p>
        </footer>
      </div>

      {/* Add custom styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
};

export default ModernCryptoDashboard;