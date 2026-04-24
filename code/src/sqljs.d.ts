declare module "sql.js" {
  type QueryResult = {
    columns: string[];
    values: unknown[][];
  };

  class Database {
    constructor(data?: Uint8Array);
    run(sql: string): Database;
    exec(sql: string): QueryResult[];
    export(): Uint8Array;
    close(): void;
  }

  type SqlJsStatic = {
    Database: typeof Database;
  };

  export default function initSqlJs(): Promise<SqlJsStatic>;
}
