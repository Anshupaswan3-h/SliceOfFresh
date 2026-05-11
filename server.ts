import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://brmnxjrryubnuezqobud.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_UR5B9Oy40v2dI6QgEd3WoQ_v4JIqoUK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/transactions', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Supabase Error Details:', error);
        return res.status(error.code === 'PGRST116' ? 404 : 500).json({ 
          error: error.message,
          hint: error.hint,
          details: error.details
        });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Unexpected Server Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/transactions/sync', async (req, res) => {
    const { transactions } = req.body; // Full list to upsert/replace
    try {
      // For simplicity, we'll upsert all provided transactions
      // Note: This assumes the table 'transactions' exists with 'id' as PK
      const { error } = await supabase
        .from('transactions')
        .upsert(transactions);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Supabase Sync Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Supabase Delete Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
