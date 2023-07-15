// external tooling
import * as resolve from "resolve";
import type {AtImportOptions} from 'postcss-import'
import * as path from "path";

const addFilenamePrefix = (id: string, prefix = "-") =>
  path.join(path.dirname(id), `${prefix}${path.basename(id)}`);

const moduleDirectories = ["web_modules", "node_modules"];

function resolveModule(id: string, opts: resolve.Opts) {
  return new Promise((res, rej) => {
    resolve(id, opts, (err, path) => (err ? rej(err) : res(path)));
  });
}

export default function (id: string, base: string, options:AtImportOptions) {
  const paths = options.path as string[];

  const resolveOpts = {
    basedir: base,
    moduleDirectory: moduleDirectories.concat(options.addModulesDirectories ?? []),
    paths,
    extensions: [".css", ".scss", ".less"],
    packageFilter: function processPackage(pkg: any) {
      if (pkg.style) pkg.main = pkg.style;
      else if (!pkg.main || !/\.css$/.test(pkg.main)) pkg.main = "index.css";
      return pkg;
    },
    preserveSymlinks: false,
  };

  return (
    resolveModule(`./${id}`, resolveOpts)
      // 兼容scss代码片段
      .catch(() => resolveModule(`./${addFilenamePrefix(id, "_")}`, resolveOpts))
      .catch(() => resolveModule(id, resolveOpts))
      .catch(() => {
        if (paths.indexOf(base) === -1) paths.unshift(base);

        throw new Error(
          `Failed to find '${id}'
  in [
    ${paths.join(",\n        ")}
  ]`
        );
      })
  );
}
