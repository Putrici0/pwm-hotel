import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SqliteFavoritesService {
  private readonly dbName = 'hotel_favorites';
  private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initialized = false;

  async getFavoritesByUser(email: string): Promise<string[]> {
    await this.ensureReady();
    if (!this.db) return [];

    const result = await this.db.query('SELECT dish_id FROM favorites WHERE user_email = ? ORDER BY dish_id', [email]);
    const values = (result.values || []).map((row: Record<string, unknown>) => String(row['dish_id'] || ''));
    return values.filter(Boolean);
  }

  async setFavorite(email: string, dishId: string, isFavorite: boolean): Promise<void> {
    await this.ensureReady();
    if (!this.db) return;

    if (isFavorite) {
      await this.db.run(
        'INSERT OR IGNORE INTO favorites (user_email, dish_id) VALUES (?, ?)',
        [email, dishId]
      );
      return;
    }

    await this.db.run('DELETE FROM favorites WHERE user_email = ? AND dish_id = ?', [email, dishId]);
  }

  private async ensureReady(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    const platform = Capacitor.getPlatform();

    if (platform === 'web') return;

    this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
    await this.db.open();
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_email TEXT NOT NULL,
        dish_id TEXT NOT NULL,
        PRIMARY KEY (user_email, dish_id)
      );
    `);
  }

}
