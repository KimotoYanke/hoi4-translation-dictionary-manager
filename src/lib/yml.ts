import * as fs from "fs";
import * as fse from "fs-extra";
import * as util from "util";
import * as cliProgress from "cli-progress";
import * as path from "path";

export const readYMLFileEach = async (
    f: string,
    fn: (s: { key: string; translation: string }) => Promise<void>
) => {
    const s = await fse.readFile(f, "utf8");
    const lines = s.split(/(\r\n|\n|\r)/);
    const bar = new cliProgress.SingleBar(
        {
            format:
                path.basename(f).padEnd(50).substring(0, 50) +
                "\t{bar} | {percentage}%\t|| {value}/{total} Chunks",
        },
        cliProgress.Presets.shades_classic
    );
    bar.start(lines.length - 1, 0);
    let c = 0;
    for await (const line of lines) {
        const match = line.trim().match(/^\s*([^\s#]+:0)\s\"((?:[^\"]|\\\")*)\"$/);
        bar.update(c);
        if (match !== null) {
            const key = match[1];
            const english = match[2];
            await fn({ key, translation: english });
        }
        c++;
    }
    bar.stop();
};

export const readdirAllFiles = async function* (dir: string): AsyncGenerator<string> {
    const readdir = util.promisify(fs.readdir);
    const dirents: fs.Dirent[] = await readdir(dir, { withFileTypes: true });
    for await (const dirent of dirents) {
        if (dirent.isFile()) {
            yield path.join(dir, dirent.name);

            continue;
        }
        yield* await readdirAllFiles(path.resolve(dir, dirent.name));
    }
};
