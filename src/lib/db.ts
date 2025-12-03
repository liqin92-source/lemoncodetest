import Database from "better-sqlite3";

const db = new Database("data.sqlite");

db.exec(`
  create table if not exists users (
    id integer primary key autoincrement,
    firstname text not null,
    lastname text not null,
    email text not null unique,
    phone text not null,
    password text not null,
    status text not null
  );
`);

export default db;


