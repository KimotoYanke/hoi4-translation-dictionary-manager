import * as sqlite3_ from "sqlite3";
const sqlite3 = sqlite3_.verbose();

export const dbInit = (file: string): sqlite3_.Database => {
  const database = new sqlite3.Database(file);
  return database;
};

export type TransTableRow = {
  key: string;
  english?: string;
  japanese?: string;
  mod: string;
};
export default class TransTable {
  db: sqlite3_.Database;

  constructor(database: sqlite3_.Database) {
    this.db = database;
  }

  static async createTableIfNotExists(db: sqlite3_.Database) {
    return new Promise((resolve, reject) => {
      try {
        db.run(`create table if not exists translations (
            key text primary key,
            english text,
            japanese text,
            mod text primary key
          )`);
        return resolve();
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async beginTransaction(db: sqlite3_.Database) {
    return new Promise((resolve, reject) => {
      try {
        db.exec("begin transaction", () => resolve());
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async commit(db: sqlite3_.Database) {
    return new Promise((resolve, reject) => {
      try {
        db.exec("commit", () => resolve());
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async save(db: sqlite3_.Database, data: TransTableRow) {
    return new Promise((resolve, reject) => {
      try {
        db.run(
          `insert or replace into translations 
            (key, english, japanese, mod)
            values ($key, $english, $japanese, $mod)`,
          data.key,
          data.english,
          data.japanese,
          data.mod,
          () => resolve()
        );
      } catch (error) {
        return reject(error);
      }
    });
  }

  static async addTranslation(db: sqlite3_.Database, key: string, mod: string, japanese: string) {
    return new Promise((resolve, reject) => {
      try {
        db.run(
          `update translations set
            japanese=$japanese
            where key=$key, mod=$mod`,
          japanese, key, mod,
          () => resolve()
        );
      } catch (error) {
        return reject(error);
      }
    });
  }
}
