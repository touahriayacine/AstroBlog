const mysql = require("mysql2");
const env = require("dotenv");
const bcrypt = require("bcrypt");

env.config();

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

async function emailExists(email) {
    const [rows] = await pool.query("SELECT id from user where email = ?", [email]);
    return rows.length > 0;
}

async function addNewUser(user) {
    let sql;
    let inputs = [];
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(user.password, salt);
    if (user.details) {
        sql = "INSERT INTO user (email,fullname,is_admin,category, details) values (?,?,0,?,?,?)";
        inputs.push(user.email, user.fullname, user.about, user.other, password);
    } else {
        sql = "INSERT INTO user (email,fullname,is_admin,category,user_password) values (?,?,0,?,?)";
        inputs.push(user.email, user.fullname, user.about, password);
    }
    const result = await pool.query(sql, inputs);
    return result;
}

async function getPassword(email) {
    const [rows] = await pool.query("SELECT user_password as password from user where email = ?", [email]);
    return rows[0];
}

module.exports = { addNewUser, emailExists, getPassword };