'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(userId: string, stockSymbol: string, company: string): Promise<void> {
  if (!userId || !stockSymbol) return;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Check if the stock symbol is already in the user's watchlist
    const existingWatchlist = await getWatchlist(userId, stockSymbol);
    if (!existingWatchlist) {
      // If the stock symbol is not in the watchlist, add it
      await Watchlist.create({ userId, symbol: stockSymbol, company });
    }
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    throw error;
  }
}

export async function removeFromWatchlist(userId: string, stockSymbol: string): Promise<void> {
  if (!userId || !stockSymbol) return;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Check if the stock symbol is in the user's watchlist
    const existingWatchlist = await getWatchlist(userId, stockSymbol);
    
    if (existingWatchlist) {
      // If the stock symbol is in the watchlist, remove it
      const res = await Watchlist.deleteOne({ userId, symbol: stockSymbol });
    }
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    throw error;
  }
}

async function getWatchlist(userId: string, stockSymbol: string): Promise<any> {
  if (!userId || !stockSymbol) return null;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Find the user's watchlist by userId and stockSymbol
    return Watchlist.findOne({ userId, symbol: stockSymbol });
  } catch (error) {
    console.error('Error getting watchlist:', error);
    throw error;
  }
}