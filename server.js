
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

// Adatbázis kapcsolat
const dbPool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "fitness_db",
    port: 3000,
});

app.use(express.json());
app.use(express.static("public"));

// 1. Összes bérlet
app.get("/berletek", async (req, res) => {
    try {
        const sql = `
            SELECT
                berletek.id,
                berletek.megnevezes,
                berletek.ar,
                berletek.ervenyes_napok,
                berletek.diak_kedvezmeny,
                tipusok.nev AS tipus_nev
            FROM berletek
            INNER JOIN tipusok
                ON berletek.tipus_id = tipusok.id
            ORDER BY berletek.ar ASC;
        `;

        const [results] = await dbPool.query(sql);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ hiba: "Adatbázis hiba" });
    }
});

// 2. Diákkedvezményes bérletek
app.get("/berletek/elerheto", async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM berletek
            WHERE diak_kedvezmeny = 1
            AND ervenyes_napok <= 30;
        `;

        const [results] = await dbPool.query(sql);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ hiba: "Adatbázis hiba" });
    }
});

// 3. Bérletek keresése
app.get("/berletek/kereses/:szoveg", async (req, res) => {
    try {
        const szoveg = req.params.szoveg;

        const sql = `
            SELECT *
            FROM berletek
            WHERE megnevezes LIKE ?;
        `;

        const [results] = await dbPool.query(sql, [`%${szoveg}%`]);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ hiba: "Adatbázis hiba" });
    }
});

// 4. Típusonkénti statisztika
app.get("/tipusok/statisztika", async (req, res) => {
    try {
        const sql = `
            SELECT
                tipusok.nev AS tipus_nev,
                COUNT(berletek.id) AS berletek_szama,
                ROUND(AVG(berletek.ar), 1) AS atlagos_ar
            FROM tipusok
            LEFT JOIN berletek
                ON tipusok.id = berletek.tipus_id
            GROUP BY tipusok.id, tipusok.nev;
        `;

        const [results] = await dbPool.query(sql);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ hiba: "Adatbázis hiba" });
    }
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
