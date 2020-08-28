import { Command, flags } from "@oclif/command";
import TransTable, { dbInit, TransTableRow } from "../lib/trans-table";
import * as path from "path";
import { readdirAllFiles, readYMLFileEach } from '../lib/yml';

export default class ImportMod extends Command {
  static description = "import from translation mod";

  static flags = {
    help: flags.help({ char: "h" }),
    db: flags.string({ char: "d", default: "./db.sqlite3" }),
    mod: flags.string({ char: "m", required: true }),
  };

  static args = [
    { name: "dir", description: "localisation/を指定する", required: true },
  ];

  async run() {
    const { args, flags } = this.parse(ImportMod);

    const db = dbInit(flags.db);
    TransTable.createTableIfNotExists(db);

    const dir = path.resolve(args.dir);

    TransTable.beginTransaction(db);
    for await (const f of readdirAllFiles(dir)) {
      await readYMLFileEach(f, async (s) => {
        await TransTable.addTranslation(db, s.key, flags.mod, s.translation);
      });
    }
    TransTable.commit(db);
  }
}
