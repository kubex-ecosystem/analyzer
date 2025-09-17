import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Activity, Code, Zap, Target, AlertTriangle, CheckCircle, Clock, Globe, TrendingUp, Eye, Filter } from 'lucide-react';

const I18nDashboard = () => {
  // Estados principais
  const [stats, setStats] = useState(null);
  const [usages, setUsages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [realTimeEvents, setRealTimeEvents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  
  // WebSocket ref
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Conecta WebSocket
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Em produção seria ws://localhost:8080/ws
      // Para demo, vamos simular dados
      setConnectionStatus('connected');
      simulateInitialData();
      simulateRealTimeUpdates();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      setConnectionStatus('error');
      
      // Tentativa de reconexão
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  };

  // Simula dados iniciais para demonstração
  const simulateInitialData = () => {
    const mockStats = {
      totalUsages: 147,
      coveragePercent: 87.5,
      qualityScore: 78.2,
      usagesByType: {
        't()': 89,
        'useTranslation': 12,
        'Trans': 31,
        'Translation': 15
      },
      usagesByComponent: {
        'UserProfile': 23,
        'ProductCard': 18,
        'Navigation': 15,
        'LoginForm': 12,
        'Dashboard': 25,
        'Settings': 8,
        'Modal': 16,
        'Button': 30
      },
      missingKeys: ['user.profile.bio', 'product.description', 'common.loading'],
      hardcodedStrings: [
        { text: 'Click here to continue', filePath: 'src/Button.tsx', line: 23 },
        { text: 'User not found', filePath: 'src/UserService.ts', line: 45 },
        { text: 'Loading...', filePath: 'src/Spinner.tsx', line: 12 }
      ],
      lastUpdate: new Date()
    };

    const mockUsages = [
      {
        key: 'user.profile.title',
        filePath: 'src/components/UserProfile.tsx',
        line: 45,
        component: 'UserProfile',
        callType: 't()',
        jsxContext: '<h1 className="profile-header">',
        aiContext: {
          componentPurpose: 'User Profile Component',
          uiElementType: 'Heading',
          qualityScore: 85,
          businessContext: 'User Management'
        },
        timestamp: new Date()
      },
      {
        key: 'common.button.save',
        filePath: 'src/components/SaveButton.tsx',
        line: 12,
        component: 'SaveButton',
        callType: 't()',
        jsxContext: '<button onClick={handleSave}>',
        aiContext: {
          componentPurpose: 'Interactive Button',
          uiElementType: 'Button',
          qualityScore: 92,
          businessContext: 'General Application'
        },
        timestamp: new Date()
      },
      {
        key: 'product.card.price',
        filePath: 'src/components/ProductCard.tsx',
        line: 67,
        component: 'ProductCard',
        callType: 't()',
        jsxContext: '<span className="price-label">',
        aiContext: {
          componentPurpose: 'Product Display Component',
          uiElementType: 'Inline Text',
          qualityScore: 78,
          businessContext: 'Product Catalog'
        },
        timestamp: new Date()
      }
    ];

    setStats(mockStats);
    setUsages(mockUsages);
  };

  // Simula updates em tempo real
  const simulateRealTimeUpdates = () => {
    setInterval(() => {
      const event = {
        type: Math.random() > 0.7 ? 'usages_updated' : 'stats_updated',
        timestamp: new Date(),
        data: Math.random() > 0.5 ? 'UserProfile.tsx modified' : 'New translation added'
      };
      
      setRealTimeEvents(prev => [event, ...prev.slice(0, 4)]);
      
      // Simula pequenas mudanças nas stats
      setStats(prev => prev ? {
        ...prev,
        totalUsages: prev.totalUsages + Math.floor(Math.random() * 3 - 1),
        coveragePercent: Math.max(0, Math.min(100, prev.coveragePercent + (Math.random() * 2 - 1))),
        qualityScore: Math.max(0, Math.min(100, prev.qualityScore + (Math.random() * 2 - 1))),
        lastUpdate: new Date()
      } : null);
    }, 3000);
  };

  // Filtra usages baseado nos filtros ativos
  const filteredUsages = usages.filter(usage => {
    if (filterType !== 'all' && usage.callType !== filterType) return false;
    
    if (qualityFilter !== 'all') {
      const score = usage.aiContext?.qualityScore || 0;
      if (qualityFilter === 'high' && score < 80) return false;
      if (qualityFilter === 'medium' && (score < 60 || score >= 80)) return false;
      if (qualityFilter === 'low' && score >= 60) return false;
    }
    
    return true;
  });

  // Dados para gráficos
  const coverageHistoryData = [
    { time: '10:00', coverage: 82, quality: 75 },
    { time: '10:15', coverage: 84, quality: 76 },
    { time: '10:30', coverage: 86, quality: 77 },
    { time: '10:45', coverage: 87, quality: 78 },
    { time: '11:00', coverage: 87.5, quality: 78.2 }
  ];

  const typeDistributionColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Conectando ao monitoramento i18n...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold">i18n Real-time Monitor</h1>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400' :
                'bg-red-400'
              }`}></div>
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            Última atualização: {stats.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Usages"
            value={stats.totalUsages}
            icon={<Code className="w-6 h-6" />}
            color="blue"
            trend="+3 hoje"
          />
          <MetricCard
            title="Cobertura i18n"
            value={`${stats.coveragePercent.toFixed(1)}%`}
            icon={<Target className="w-6 h-6" />}
            color="green"
            trend="+2.1% esta semana"
          />
          <MetricCard
            title="Score de Qualidade"
            value={`${stats.qualityScore.toFixed(1)}/100`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
            trend="+1.2 pontos"
          />
          <MetricCard
            title="Strings Hardcoded"
            value={stats.hardcodedStrings.length}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            trend="-2 corrigidas"
          />
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Histórico de Cobertura */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Histórico de Cobertura & Qualidade
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={coverageHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="coverage"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="Cobertura %"
                />
                <Area
                  type="monotone"
                  dataKey="quality"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="Qualidade"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Tipo */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Distribuição por Tipo de Chamada
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.usagesByType).map(([key, value], index) => ({
                    name: key,
                    value,
                    color: typeDistributionColors[index]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats.usagesByType).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={typeDistributionColors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Componentes mais utilizados */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-green-500" />
            Usages por Componente
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.usagesByComponent).map(([name, value]) => ({name, value}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtros e Lista de Usages */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-500" />
                Usages Detalhados ({filteredUsages.length})
              </h3>
              
              <div className="flex space-x-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="t()">t() calls</option>
                  <option value="useTranslation">Hooks</option>
                  <option value="Trans">Components</option>
                </select>
                
                <select
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm"
                >
                  <option value="all">Todas qualidades</option>
                  <option value="high">Alta (80+)</option>
                  <option value="medium">Média (60-79)</option>
                  <option value="low">Baixa (&lt;60)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsages.map((usage, index) => (
                <UsageCard
                  key={index}
                  usage={usage}
                  onClick={() => setSelectedFile(usage)}
                  isSelected={selectedFile?.filePath === usage.filePath && selectedFile?.line === usage.line}
                />
              ))}
            </div>
          </div>

          {/* Real-time Events & Alerts */}
          <div className="space-y-6">
            {/* Events em tempo real */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                Eventos em Tempo Real
              </h3>
              
              <div className="space-y-2">
                {realTimeEvents.map((event, index) => (
                  <div key={index} className="flex items-center text-sm p-2 bg-gray-700 rounded">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      event.type === 'usages_updated' ? 'bg-blue-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-gray-300">{event.data}</div>
                      <div className="text-xs text-gray-500">
                        {event.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Alertas & Problemas
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center text-red-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {stats.hardcodedStrings.length} strings hardcoded encontradas
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Última: {stats.hardcodedStrings[0]?.text}
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center text-yellow-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {stats.missingKeys.length} chaves faltantes
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Próxima: {stats.missingKeys[0]}
                  </div>
                </div>
                
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center text-green-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sistema funcionando normalmente
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Última verificação: agora
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de métrica
const MetricCard = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    red: 'text-red-400 bg-red-500/10'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Componente de usage individual
const UsageCard = ({ usage, onClick, isSelected }) => {
  const qualityColor = usage.aiContext?.qualityScore >= 80 ? 'text-green-400' :
                      usage.aiContext?.qualityScore >= 60 ? 'text-yellow-400' :
                      'text-red-400';

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-blue-400">{usage.key}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              usage.callType === 't()' ? 'bg-green-500/20 text-green-400' :
              usage.callType === 'useTranslation' ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {usage.callType}
            </span>
          </div>
          
          <div className="text-xs text-gray-400 mt-1">
            {usage.filePath}:{usage.line} • {usage.component}
          </div>
          
          {usage.jsxContext && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              {usage.jsxContext}
            </div>
          )}
        </div>
        
        {usage.aiContext && (
          <div className="text-right">
            <div className={`text-sm font-bold ${qualityColor}`}>
              {usage.aiContext.qualityScore}/100
            </div>
            <div className="text-xs text-gray-500">
              {usage.aiContext.uiElementType}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default I18nDashboard;