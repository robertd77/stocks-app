import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';
import { Watchlist as WatchlistModel } from '@/database/models/watchlist.model';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WatchlistButton from '@/components/WatchlistButton';
import { getMarketDataForSymbols } from '@/lib/actions/finnhub.actions';

type WatchlistItem = {
  symbol: string;
  company: string;
  addedAt?: string;
};

export default async function WatchlistPage() {
  // Get session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    // not signed in, redirect to sign-in
    redirect('/sign-in');
  }

  const userId = session.user.id;

  // Fetch watchlist items from DB
  try {
    await connectToDatabase();
    const items = await WatchlistModel.find({ userId }).select('symbol company addedAt -_id').lean();

    const watchlist: WatchlistItem[] = (items || []).map((it: any) => ({
      symbol: String(it.symbol || '').toUpperCase(),
      company: String(it.company || ''),
      addedAt: it.addedAt ? new Date(it.addedAt).toISOString() : undefined,
    }));

    // Fetch market data for the listed symbols (price, change, pe, marketCap)
    const symbols = watchlist.map((w) => w.symbol);
    const marketData = await getMarketDataForSymbols(symbols);

    const formatPrice = (v: number | null) => (v === null ? '-' : `$${v.toFixed(2)}`);
    const formatChange = (v: number | null, p: number | null) => {
      if (v === null && p === null) return '-';
      const sign = (v || 0) > 0 ? '+' : (v || 0) < 0 ? '' : '';
      const abs = v === null ? '-' : `${sign}${v.toFixed(2)}`;
      const pct = p === null ? '' : ` (${p >= 0 ? '+' : ''}${p.toFixed(2)}%)`;
      return `${abs}${pct}`;
    };

    const formatNumberShort = (n: number | null) => {
      if (n === null) return '-';
      const abs = Math.abs(n);
      if (abs >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`;
      if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
      if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
      if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
      return String(n.toFixed(2));
    };

    return (
      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4">My Watchlist</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Daily Change</TableHead>
              <TableHead>P/E</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlist.map((item) => {
              const md = marketData[item.symbol] || { currentPrice: null, change: null, percentChange: null, peRatio: null, marketCap: null };
              const changeValue = md.percentChange ?? md.change ?? 0;
              const changeClass = md.percentChange == null && md.change == null
                ? 'text-gray-400'
                : (changeValue > 0 ? 'text-emerald-400' : changeValue < 0 ? 'text-rose-400' : 'text-gray-400');

              return (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium">{item.symbol}</TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell>{formatPrice(md.currentPrice)}</TableCell>
                  <TableCell className={changeClass}>{formatChange(md.change, md.percentChange)}</TableCell>
                  <TableCell>{md.peRatio !== null ? md.peRatio.toFixed(2) : '-'}</TableCell>
                  <TableCell>{formatNumberShort(md.marketCap)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <WatchlistButton
                        symbol={item.symbol}
                        company={item.company}
                        isInWatchlist={true}
                        showTrashIcon={false}
                        user={{ id: userId }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  } catch (err) {
    console.error('Error loading watchlist page:', err);
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Watchlist</h2>
        <p>Could not load your watchlist. Please try again later.</p>
      </div>
    );
  }
}