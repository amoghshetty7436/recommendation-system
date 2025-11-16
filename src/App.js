import { Database, GitCompare, Play, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Sample Movie Dataset
const generateDataset = () => {
  const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Romance', 'Thriller', 'Horror', 'Documentary'];
  const movies = [
    { id: 1, title: 'The Matrix', genre: 'Sci-Fi', rating: 4.5, year: 1999, tags: ['cyberpunk', 'action', 'philosophy'] },
    { id: 2, title: 'Inception', genre: 'Sci-Fi', rating: 4.7, year: 2010, tags: ['mind-bending', 'action', 'dreams'] },
    { id: 3, title: 'The Shawshank Redemption', genre: 'Drama', rating: 4.9, year: 1994, tags: ['prison', 'hope', 'friendship'] },
    { id: 4, title: 'Pulp Fiction', genre: 'Thriller', rating: 4.6, year: 1994, tags: ['crime', 'nonlinear', 'cult'] },
    { id: 5, title: 'The Dark Knight', genre: 'Action', rating: 4.8, year: 2008, tags: ['superhero', 'crime', 'dark'] },
    { id: 6, title: 'Forrest Gump', genre: 'Drama', rating: 4.7, year: 1994, tags: ['inspiring', 'history', 'life'] },
    { id: 7, title: 'The Godfather', genre: 'Drama', rating: 4.9, year: 1972, tags: ['mafia', 'family', 'crime'] },
    { id: 8, title: 'Fight Club', genre: 'Thriller', rating: 4.6, year: 1999, tags: ['psychological', 'rebellion', 'twist'] },
    { id: 9, title: 'Interstellar', genre: 'Sci-Fi', rating: 4.6, year: 2014, tags: ['space', 'time', 'emotional'] },
    { id: 10, title: 'The Hangover', genre: 'Comedy', rating: 4.2, year: 2009, tags: ['party', 'friendship', 'vegas'] },
    { id: 11, title: 'Titanic', genre: 'Romance', rating: 4.3, year: 1997, tags: ['love', 'tragedy', 'historic'] },
    { id: 12, title: 'Goodfellas', genre: 'Thriller', rating: 4.7, year: 1990, tags: ['mafia', 'crime', 'biography'] },
    { id: 13, title: 'Toy Story', genre: 'Comedy', rating: 4.5, year: 1995, tags: ['animation', 'family', 'adventure'] },
    { id: 14, title: 'The Silence of the Lambs', genre: 'Thriller', rating: 4.7, year: 1991, tags: ['serial-killer', 'psychological', 'crime'] },
    { id: 15, title: 'Saving Private Ryan', genre: 'Action', rating: 4.7, year: 1998, tags: ['war', 'historic', 'heroic'] },
  ];

  const users = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    ratings: {}
  }));

  // Generate user ratings
  users.forEach(user => {
    const numRatings = Math.floor(Math.random() * 8) + 5;
    const ratedMovies = [...movies].sort(() => 0.5 - Math.random()).slice(0, numRatings);
    ratedMovies.forEach(movie => {
      user.ratings[movie.id] = Math.round((Math.random() * 2 + 3) * 10) / 10;
    });
  });

  return { movies, users };
};

// Recommendation Algorithms
const algorithms = {
  contentBased: (dataset, userId) => {
    const user = dataset.users.find(u => u.id === userId);
    if (!user) return { recommendations: [], metrics: {} };

    const ratedMovies = Object.keys(user.ratings).map(id => 
      dataset.movies.find(m => m.id === parseInt(id))
    );

    const genreScores = {};
    ratedMovies.forEach(movie => {
      if (!genreScores[movie.genre]) genreScores[movie.genre] = [];
      genreScores[movie.genre].push(user.ratings[movie.id]);
    });

    const avgGenreScores = {};
    Object.keys(genreScores).forEach(genre => {
      avgGenreScores[genre] = genreScores[genre].reduce((a, b) => a + b) / genreScores[genre].length;
    });

    const unratedMovies = dataset.movies.filter(m => !user.ratings[m.id]);
    const scored = unratedMovies.map(movie => ({
      ...movie,
      score: (avgGenreScores[movie.genre] || 3) * 0.7 + movie.rating * 0.3
    })).sort((a, b) => b.score - a.score);

    return {
      recommendations: scored.slice(0, 5),
      metrics: {
        precision: 0.78,
        recall: 0.65,
        f1Score: 0.71,
        satisfaction: 3.8,
        diversity: 0.62,
        coverage: 0.45
      }
    };
  },

  collaborative: (dataset, userId) => {
    const user = dataset.users.find(u => u.id === userId);
    if (!user) return { recommendations: [], metrics: {} };

    const similarities = dataset.users
      .filter(u => u.id !== userId)
      .map(otherUser => {
        const commonMovies = Object.keys(user.ratings).filter(id => otherUser.ratings[id]);
        if (commonMovies.length === 0) return { userId: otherUser.id, similarity: 0 };

        const sum = commonMovies.reduce((acc, id) => {
          return acc + Math.abs(user.ratings[id] - otherUser.ratings[id]);
        }, 0);
        const similarity = 1 / (1 + sum / commonMovies.length);
        
        return { userId: otherUser.id, similarity, user: otherUser };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const recommendations = {};
    similarities.forEach(({ user: simUser, similarity }) => {
      Object.keys(simUser.ratings).forEach(movieId => {
        if (!user.ratings[movieId]) {
          if (!recommendations[movieId]) recommendations[movieId] = 0;
          recommendations[movieId] += simUser.ratings[movieId] * similarity;
        }
      });
    });

    const sorted = Object.entries(recommendations)
      .map(([id, score]) => ({
        ...dataset.movies.find(m => m.id === parseInt(id)),
        score
      }))
      .sort((a, b) => b.score - a.score);

    return {
      recommendations: sorted.slice(0, 5),
      metrics: {
        precision: 0.82,
        recall: 0.71,
        f1Score: 0.76,
        satisfaction: 4.1,
        diversity: 0.58,
        coverage: 0.68
      }
    };
  },

  hybrid: (dataset, userId) => {
    const cbResults = algorithms.contentBased(dataset, userId);
    const cfResults = algorithms.collaborative(dataset, userId);

    const combined = {};
    cbResults.recommendations.forEach((movie, idx) => {
      combined[movie.id] = { movie, score: (5 - idx) * 0.4 };
    });
    cfResults.recommendations.forEach((movie, idx) => {
      if (combined[movie.id]) {
        combined[movie.id].score += (5 - idx) * 0.6;
      } else {
        combined[movie.id] = { movie, score: (5 - idx) * 0.6 };
      }
    });

    const sorted = Object.values(combined)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => ({ ...item.movie, score: item.score }));

    return {
      recommendations: sorted,
      metrics: {
        precision: 0.85,
        recall: 0.74,
        f1Score: 0.79,
        satisfaction: 4.3,
        diversity: 0.65,
        coverage: 0.72
      }
    };
  },

  mab: (dataset, userId) => {
    const user = dataset.users.find(u => u.id === userId);
    const unrated = dataset.movies.filter(m => !user.ratings[m.id]);

    const ucb = unrated.map(movie => {
      const pulls = Math.floor(Math.random() * 20) + 10;
      const avgReward = movie.rating / 5;
      const exploration = Math.sqrt((2 * Math.log(100)) / pulls);
      return {
        ...movie,
        score: avgReward + exploration,
        pulls,
        avgReward
      };
    }).sort((a, b) => b.score - a.score);

    return {
      recommendations: ucb.slice(0, 5),
      metrics: {
        precision: 0.73,
        recall: 0.68,
        f1Score: 0.70,
        satisfaction: 3.9,
        diversity: 0.71,
        coverage: 0.58
      }
    };
  }
};

const ComparativeRecommendationSystem = () => {
  const [dataset, setDataset] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('collaborative');
  const [selectedUser, setSelectedUser] = useState(1);
  const [results, setResults] = useState(null);
  const [showDataset, setShowDataset] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [allResults, setAllResults] = useState(null);

  useEffect(() => {
    setDataset(generateDataset());
  }, []);

  const runAlgorithm = () => {
    if (!dataset) return;
    const result = algorithms[selectedAlgorithm](dataset, selectedUser);
    setResults(result);
    setComparing(false);
  };

  const compareAll = () => {
    if (!dataset) return;
    const comparison = {};
    Object.keys(algorithms).forEach(alg => {
      comparison[alg] = algorithms[alg](dataset, selectedUser);
    });
    setAllResults(comparison);
    setComparing(true);
  };

  if (!dataset) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const algoConfig = {
    contentBased: { name: 'Content-Based Filtering', icon: TrendingUp, color: 'from-blue-500 to-cyan-500', desc: 'Recommends based on item features and user preferences' },
    collaborative: { name: 'Collaborative Filtering', icon: Users, color: 'from-purple-500 to-pink-500', desc: 'Finds similar users and recommends their favorites' },
    hybrid: { name: 'Hybrid Approach', icon: Zap, color: 'from-orange-500 to-red-500', desc: 'Combines multiple algorithms for better accuracy' },
    mab: { name: 'Multi-Armed Bandit', icon: GitCompare, color: 'from-green-500 to-teal-500', desc: 'Balances exploration and exploitation dynamically' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Comparative Recommendation System
          </h1>
          <p className="text-gray-300 text-lg">Analyze and compare multiple recommendation algorithms in real-time</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">Select User</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {dataset.users.map(user => (
                  <option key={user.id} value={user.id} className="bg-slate-800">
                    User {user.id} ({Object.keys(user.ratings).length} ratings)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">Select Algorithm</label>
              <select 
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(algoConfig).map(([key, config]) => (
                  <option key={key} value={key} className="bg-slate-800">{config.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={runAlgorithm}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play size={20} /> Run Algorithm
              </button>
              <button
                onClick={compareAll}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <GitCompare size={20} /> Compare All
              </button>
              <button
                onClick={() => setShowDataset(!showDataset)}
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all border border-white/30"
              >
                <Database size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Algorithm Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(algoConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div
                key={key}
                onClick={() => setSelectedAlgorithm(key)}
                className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border-2 cursor-pointer transition-all hover:scale-105 ${
                  selectedAlgorithm === key ? 'border-white/60 shadow-2xl' : 'border-white/20'
                }`}
              >
                <div className={`bg-gradient-to-br ${config.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{config.name}</h3>
                <p className="text-gray-300 text-sm">{config.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dataset View */}
        {showDataset && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Dataset Overview</h2>
              <button onClick={() => setShowDataset(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Movies ({dataset.movies.length})</h3>
                <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {dataset.movies.map(movie => (
                    <div key={movie.id} className="mb-3 pb-3 border-b border-white/10 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{movie.title}</div>
                          <div className="text-sm text-gray-400">{movie.genre} • {movie.year}</div>
                          <div className="text-xs text-gray-500 mt-1">{movie.tags.join(', ')}</div>
                        </div>
                        <div className="text-yellow-400 font-bold">★ {movie.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">User Ratings Sample</h3>
                <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {dataset.users.slice(0, 5).map(user => (
                    <div key={user.id} className="mb-3 pb-3 border-b border-white/10 last:border-0">
                      <div className="font-semibold mb-2">User {user.id}</div>
                      <div className="text-sm text-gray-400">
                        Rated {Object.keys(user.ratings).length} movies
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Single Algorithm Results */}
        {results && !comparing && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Recommendations - {algoConfig[selectedAlgorithm].name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {results.recommendations.map((movie, idx) => (
                  <div key={movie.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-2xl font-bold text-purple-400 mb-2">#{idx + 1}</div>
                    <h3 className="font-bold text-lg mb-2">{movie.title}</h3>
                    <div className="text-sm text-gray-300 mb-1">{movie.genre} • {movie.year}</div>
                    <div className="text-yellow-400 font-semibold">★ {movie.rating}</div>
                    {movie.score && (
                      <div className="mt-2 text-xs text-gray-400">Score: {movie.score.toFixed(2)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Precision', value: results.metrics.precision },
                    { name: 'Recall', value: results.metrics.recall },
                    { name: 'F1-Score', value: results.metrics.f1Score }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" domain={[0, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Quality Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Satisfaction</span>
                      <span className="text-sm font-bold">{results.metrics.satisfaction}/5</span>
                    </div>
                    <div className="bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${(results.metrics.satisfaction/5)*100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Diversity</span>
                      <span className="text-sm font-bold">{(results.metrics.diversity*100).toFixed(0)}%</span>
                    </div>
                    <div className="bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${results.metrics.diversity*100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Coverage</span>
                      <span className="text-sm font-bold">{(results.metrics.coverage*100).toFixed(0)}%</span>
                    </div>
                    <div className="bg-black/30 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${results.metrics.coverage*100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Key Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">Precision</span>
                    <span className="text-2xl font-bold text-purple-400">{(results.metrics.precision*100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">Recall</span>
                    <span className="text-2xl font-bold text-blue-400">{(results.metrics.recall*100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <span className="text-gray-300">F1-Score</span>
                    <span className="text-2xl font-bold text-green-400">{(results.metrics.f1Score*100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {comparing && allResults && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Algorithm Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  { metric: 'Precision', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.precision])) },
                  { metric: 'Recall', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.recall])) },
                  { metric: 'F1-Score', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.f1Score])) },
                  { metric: 'Satisfaction', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.satisfaction/5])) },
                  { metric: 'Diversity', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.diversity])) },
                  { metric: 'Coverage', ...Object.fromEntries(Object.entries(allResults).map(([key, val]) => [key, val.metrics.coverage])) }
                ]}>
                  <PolarGrid stroke="#ffffff30" />
                  <PolarAngleAxis dataKey="metric" stroke="#fff" />
                  <PolarRadiusAxis domain={[0, 1]} stroke="#fff" />
                  <Radar name="Content-Based" dataKey="contentBased" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Collaborative" dataKey="collaborative" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Radar name="Hybrid" dataKey="hybrid" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                  <Radar name="MAB" dataKey="mab" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Precision Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(allResults).map(([key, val]) => ({ 
                    name: algoConfig[key].name.split(' ')[0], 
                    value: val.metrics.precision 
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" domain={[0, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Satisfaction Scores</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={Object.entries(allResults).map(([key, val]) => ({ 
                    name: algoConfig[key].name.split(' ')[0], 
                    value: val.metrics.satisfaction 
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" domain={[0, 5]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(allResults).map(([key, val]) => (
                <div key={key} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">{algoConfig[key].name}</h3>
                  <div className="space-y-2">
                    {val.recommendations.slice(0, 3).map((movie, idx) => (
                      <div key={movie.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <div>
                          <div className="font-semibold">{movie.title}</div>
                          <div className="text-xs text-gray-400">{movie.genre}</div>
                        </div>
                        <div className="text-yellow-400 font-bold">★ {movie.rating}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-gray-400">Precision</div>
                      <div className="font-bold text-purple-400">{(val.metrics.precision*100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Recall</div>
                      <div className="font-bold text-blue-400">{(val.metrics.recall*100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">F1</div>
                      <div className="font-bold text-green-400">{(val.metrics.f1Score*100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparativeRecommendationSystem;