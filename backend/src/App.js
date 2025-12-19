import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Film, RefreshCw, Plus, Edit2, Trash2, Search, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

//const API_BASE_URL = 'http://localhost:5000/api';
// Mock data untuk demo
const mockMovies = [
  { id: 1, title: 'The Shawshank Redemption', release_date: '2024-11-15', genre: 'Drama', popularity: 95.5, vote_average: 9.3, overview: 'Two imprisoned men bond over years...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 2, title: 'The Dark Knight', release_date: '2024-11-20', genre: 'Action', popularity: 92.3, vote_average: 9.0, overview: 'Batman faces the Joker...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 3, title: 'Inception', release_date: '2024-11-25', genre: 'Sci-Fi', popularity: 88.7, vote_average: 8.8, overview: 'A thief who steals secrets...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 4, title: 'Pulp Fiction', release_date: '2024-12-01', genre: 'Crime', popularity: 85.2, vote_average: 8.9, overview: 'Various intertwining stories...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 5, title: 'Forrest Gump', release_date: '2024-12-05', genre: 'Drama', popularity: 82.1, vote_average: 8.8, overview: 'Life story of Forrest Gump...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 6, title: 'The Matrix', release_date: '2024-12-08', genre: 'Sci-Fi', popularity: 90.5, vote_average: 8.7, overview: 'A computer hacker learns...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 7, title: 'Goodfellas', release_date: '2024-12-10', genre: 'Crime', popularity: 78.9, vote_average: 8.7, overview: 'Story of Henry Hill...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 8, title: 'The Godfather', release_date: '2024-12-12', genre: 'Crime', popularity: 94.2, vote_average: 9.2, overview: 'Aging patriarch transfers control...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 9, title: 'Interstellar', release_date: '2024-12-14', genre: 'Sci-Fi', popularity: 87.6, vote_average: 8.6, overview: 'Team of explorers travel...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 10, title: 'Gladiator', release_date: '2024-12-16', genre: 'Action', popularity: 81.3, vote_average: 8.5, overview: 'Roman general becomes gladiator...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 11, title: 'Fight Club', release_date: '2024-11-18', genre: 'Drama', popularity: 86.4, vote_average: 8.8, overview: 'An insomniac office worker...', last_updated: '2024-12-17T10:00:00Z' },
  { id: 12, title: 'The Lord of the Rings', release_date: '2024-11-22', genre: 'Fantasy', popularity: 93.1, vote_average: 8.9, overview: 'Journey to destroy the ring...', last_updated: '2024-12-17T10:00:00Z' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MovieDashboard = () => {
  const [view, setView] = useState('dashboard');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'last_updated', direction: 'desc' });
  
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '', release_date: '', genre: '', popularity: '', vote_average: '', overview: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('movies');
    const storedSync = localStorage.getItem('lastSync');
    
    if (stored) {
      const data = JSON.parse(stored);
      setMovies(data);
      setFilteredMovies(data);
    } else {
      setMovies(mockMovies);
      setFilteredMovies(mockMovies);
      localStorage.setItem('movies', JSON.stringify(mockMovies));
    }
    
    if (storedSync) {
      setLastSync(new Date(storedSync));
    }
  }, []);

const syncData = async () => {
  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:5000/api/sync', {
      method: 'POST'
    });
    const data = await response.json();
    
    // Reload movies from backend
    const moviesResponse = await fetch('http://localhost:5000/api/movies');
    const moviesData = await moviesResponse.json();
    
    setMovies(moviesData);
    setFilteredMovies(moviesData);
    
    const now = new Date();
    setLastSync(now);
    setLoading(false);
    
    alert(`Sync berhasil! ${data.synced} movie baru ditambahkan`);
  } catch (error) {
    console.error('Sync error:', error);
    setLoading(false);
    alert('Gagal sync: ' + error.message);
  }
};

  useEffect(() => {
    let result = [...movies];

    if (searchTerm) {
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.overview.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genreFilter) {
      result = result.filter(m => m.genre === genreFilter);
    }

    if (dateRange.start) {
      result = result.filter(m => new Date(m.release_date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter(m => new Date(m.release_date) <= new Date(dateRange.end));
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMovies(result);
  }, [movies, searchTerm, genreFilter, dateRange, sortConfig]);

  const handleCreate = () => {
    setEditingMovie(null);
    setFormData({ title: '', release_date: '', genre: '', popularity: '', vote_average: '', overview: '' });
    setShowModal(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({ ...movie });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this movie?')) {
      const updated = movies.filter(m => m.id !== id);
      setMovies(updated);
      localStorage.setItem('movies', JSON.stringify(updated));
    }
  };

  const handleSubmit = () => {
    const movieData = {
      ...formData,
      popularity: parseFloat(formData.popularity),
      vote_average: parseFloat(formData.vote_average),
      last_updated: new Date().toISOString()
    };

    let updated;
    if (editingMovie) {
      updated = movies.map(m => m.id === editingMovie.id ? { ...movieData, id: m.id } : m);
    } else {
      movieData.id = Date.now();
      updated = [...movies, movieData];
    }

    setMovies(updated);
    localStorage.setItem('movies', JSON.stringify(updated));
    setShowModal(false);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getGenreDistribution = () => {
    const distribution = {};
    filteredMovies.forEach(m => {
      distribution[m.genre] = (distribution[m.genre] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getDateAggregation = () => {
    const aggregation = {};
    filteredMovies.forEach(m => {
      const date = m.release_date.substring(0, 10);
      aggregation[date] = (aggregation[date] || 0) + 1;
    });
    return Object.entries(aggregation)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  const genres = [...new Set(movies.map(m => m.genre))];
  const avgRating = filteredMovies.length > 0 
    ? (filteredMovies.reduce((sum, m) => sum + m.vote_average, 0) / filteredMovies.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Movie Analytics Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setView('management')}
                className={`px-4 py-2 rounded-lg font-medium transition ${view === 'management' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Film className="w-4 h-4 inline mr-2" />
                Management
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Total Movies</div>
                <div className="text-3xl font-bold text-gray-900">{filteredMovies.length}</div>
                <div className="text-xs text-gray-500 mt-1">Movies in database</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Most Popular Genre</div>
                <div className="text-3xl font-bold text-blue-600">
                  {getGenreDistribution()[0]?.name || '-'}
                </div>
                <div className="text-xs text-gray-500 mt-1">{getGenreDistribution()[0]?.value || 0} movies</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Average Rating</div>
                <div className="text-3xl font-bold text-green-600">{avgRating}</div>
                <div className="text-xs text-gray-500 mt-1">Out of 10</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-4 flex-wrap">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Date Range Filter:</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Start Date"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="End Date"
                />
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  Clear Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Genre Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getGenreDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getGenreDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Movies by Release Date
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getDateAggregation()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} fontSize={11} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={syncData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Syncing...' : 'Sync Data'}
                </button>
                {lastSync && (
                  <span className="text-sm text-gray-600">
                    Last sync: {lastSync.toLocaleString()}
                  </span>
                )}
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Movie
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="text-sm text-gray-600 flex items-center">
                  Showing {filteredMovies.length} of {movies.length} movies
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                        Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('genre')}>
                        Genre {sortConfig.key === 'genre' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('release_date')}>
                        Release Date {sortConfig.key === 'release_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('vote_average')}>
                        Rating {sortConfig.key === 'vote_average' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('last_updated')}>
                        Last Updated {sortConfig.key === 'last_updated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMovies.map(movie => (
                      <tr key={movie.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">{movie.overview}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {movie.genre}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{movie.release_date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="font-medium">⭐ {movie.vote_average}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(movie.last_updated).toLocaleString('id-ID', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button 
                            onClick={() => handleEdit(movie)} 
                            className="text-blue-600 hover:text-blue-800 mr-3 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 inline" />
                          </button>
                          <button 
                            onClick={() => handleDelete(movie.id)} 
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter movie title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.release_date}
                      onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                    <select
                      required
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Genre</option>
                      <option value="Action">Action</option>
                      <option value="Drama">Drama</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Crime">Crime</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Fantasy">Fantasy</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Popularity *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.popularity}
                      onChange={(e) => setFormData({ ...formData, popularity: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-10) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={formData.vote_average}
                      onChange={(e) => setFormData({ ...formData, vote_average: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview *</label>
                  <textarea
                    required
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter movie description..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingMovie ? 'Update Movie' : 'Create Movie'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDashboard;