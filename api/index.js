'use strict';
const mysql = require('mysql2');
const { json, send } = require('micro');

const mysqlOpts = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'kyokko1837',
  database: 'bp',
  timezone: '+00:00',
};

/** @type {mysql.Pool} MySQLコネクションプール */
const pool = mysql.createPool(mysqlOpts);
const promisePool = pool.promise();

const insertSql =
  `insert into daily ` + `(maximum, minimum, pulse, weight) VALUES (?)`;
const selectSql = `SELECT
  *,
  date_format(convert_tz(measured_at, 'UTC', 'Asia/Tokyo'), '%m/%d %H:%i') AS dt
FROM
  daily
ORDER BY
  measured_at DESC
LIMIT 20`;

const save = async (req, res) => {
  const params = await json(req);
  const values = [params.maximum, params.minimum, params.pulse, params.weight];
  await promisePool.query(insertSql, [values]);
  send(res, 200);
};

const load = async (res) => {
  const [rows] = await promisePool.query(selectSql);
  // console.log(rows);
  send(res, 200, rows);
};

module.exports = async (req, res) => {
  switch (req.url) {
    case '/save':
      await save(req, res);
      break;
    case '/load':
      await load(res);
      break;

    default:
      break;
  }
};
