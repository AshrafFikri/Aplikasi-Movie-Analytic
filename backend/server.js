require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

console.log('🔧 Starting server...');

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    release_date TEXT NOT NULL,
    genre TEXT NOT NULL,
    popularity REAL,
    vote_average REAL,
    overview TEXT,
    poster_path TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err);
  } else {
    console.log('✅ Movies table ready');
  }
});

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Genre mapping
const genreMap = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western'
};

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// GET - Get all movies
app.get('/api/movies', (req, res) => {
  console.log('📥 GET /api/movies');
  
  db.all('SELECT * FROM movies ORDER BY last_updated DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log(`✅ Returned ${rows.length} movies`);
      res.json(rows);
    }
  });
});

// GET - Get single movie
app.get('/api/movies/:id', (req, res) => {
  console.log(`📥 GET /api/movies/${req.params.id}`);
  
  db.get('SELECT * FROM movies WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.json(row);
    }
  });
});

// POST - Create new movie
app.post('/api/movies', (req, res) => {
  console.log('📥 POST /api/movies');
  
  const { title, release_date, genre, popularity, vote_average, overview, poster_path } = req.body;

  db.run(
    `INSERT INTO movies (title, release_date, genre, popularity, vote_average, overview, poster_path)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, release_date, genre, popularity || 0, vote_average || 0, overview || '', poster_path || ''],
    function(err) {
      if (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log(`✅ Movie created with ID: ${this.lastID}`);
        res.json({
          id: this.lastID,
          message: 'Movie created successfully'
        });
      }
    }
  );
});

// PUT - Update movie
app.put('/api/movies/:id', (req, res) => {
  console.log(`📥 PUT /api/movies/${req.params.id}`);
  
  const { title, release_date, genre, popularity, vote_average, overview, poster_path } = req.body;

  db.run(
    `UPDATE movies 
     SET title = ?, release_date = ?, genre = ?, popularity = ?, 
         vote_average = ?, overview = ?, poster_path = ?, 
         last_updated = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, release_date, genre, popularity, vote_average, overview, poster_path || '', req.params.id],
    function(err) {
      if (err) {
        console.error('❌ Error:', err);
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Movie not found' });
      } else {
        console.log(`✅ Movie ${req.params.id} updated`);
        res.json({ message: 'Movie updated successfully' });
      }
    }
  );
});

// DELETE - Delete movie
app.delete('/api/movies/:id', (req, res) => {
  console.log(`📥 DELETE /api/movies/${req.params.id}`);
  
  db.run('DELETE FROM movies WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('❌ Error:', err);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      console.log(`✅ Movie ${req.params.id} deleted`);
      res.json({ message: 'Movie deleted successfully' });
    }
  });
});

// POST - Sync from TMDB API
app.post('/api/sync', async (req, res) => {
  console.log('🔄 Starting sync from TMDB...');

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });

    const movies = response.data.results;
    let syncedCount = 0;
    let updatedCount = 0;
    let processed = 0;

    for (const movie of movies) {
      const genre = movie.genre_ids && movie.genre_ids.length > 0 
        ? genreMap[movie.genre_ids[0]] || 'Unknown'
        : 'Unknown';

      // Check if exists
      await new Promise((resolve) => {
        db.get('SELECT id FROM movies WHERE tmdb_id = ?', [movie.id], (err, row) => {
          if (row) {
            // Update
            db.run(
              `UPDATE movies 
               SET title = ?, release_date = ?, genre = ?, popularity = ?, 
                   vote_average = ?, overview = ?, poster_path = ?,
                   last_updated = CURRENT_TIMESTAMP
               WHERE tmdb_id = ?`,
              [
                movie.title,
                movie.release_date || '2024-01-01',
                genre,
                movie.popularity,
                movie.vote_average,
                movie.overview,
                movie.poster_path,
                movie.id
              ],
              (err) => {
                if (!err) updatedCount++;
                processed++;
                resolve();
              }
            );
          } else {
            // Insert
            db.run(
              `INSERT INTO movies (tmdb_id, title, release_date, genre, popularity, vote_average, overview, poster_path)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                movie.id,
                movie.title,
                movie.release_date || '2024-01-01',
                genre,
                movie.popularity,
                movie.vote_average,
                movie.overview,
                movie.poster_path
              ],
              (err) => {
                if (!err) syncedCount++;
                processed++;
                resolve();
              }
            );
          }
        });
      });
    }

    // Wait for all to complete
    while (processed < movies.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Sync completed: ${syncedCount} new, ${updatedCount} updated`);
    
    res.json({
      message: 'Sync completed',
      synced: syncedCount,
      updated: updatedCount,
      total: movies.length,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Sync error:', error.message);
    res.status(500).json({ 
      error: 'Failed to sync from TMDB',
      details: error.message 
    });
  }
});

// Start server - INI YANG PENTING!
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📊 API endpoint: http://localhost:' + PORT + '/api/movies');
  console.log('🏥 Health check: http://localhost:' + PORT + '/api/health');
  console.log('='.repeat(60));
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close(() => {
    console.log('✅ Database closed');
    process.exit(0);
  });
});