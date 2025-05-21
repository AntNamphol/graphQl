const pool = require("../db");
const getSelectedFields = require("../utils/getSelectedFields");
const formatUnixToDate = require("../utils/convertStringToDate");


const resolvers = {
    Query: {
        get_idc_btt_by_id: async (_, { id }, __, info) => {
            const selectedFields = getSelectedFields(info);
            const sql = `
                        SELECT ${selectedFields}
                        FROM ${process.env.IDC_BTT_TABLE}
                        WHERE id = $1
                    `;
            let { rows } = await pool.query(sql, [id]);
            rows = rows.map((row) => {
                // Convert unixtime to date
                if (row.time) {
                    row.time = formatUnixToDate(row.time);
                }
                // Convert create_at_bi to date
                if (row.create_at_bi) {
                    row.create_at_bi = formatUnixToDate(row.create_at_bi);
                }
                if (row.unixtime) {
                    row.unixtime = formatUnixToDate(row.unixtime);
                }
                return row;
            });

            if (!rows.length) {
                return { message: `No data found with id ${id}`, data: null };
            }
            return { message: "Success", data: rows[0] };
        },
        get_idc_btt_by_limit_and_offset: async (_, { limit, page }, __, info) => {
            const selectedFields = getSelectedFields(info, "data");

            const offset = (page - 1) * limit;

            // ดึงจำนวนทั้งหมดก่อน
            const countResult = await pool.query(`SELECT COUNT(*) FROM ${process.env.IDC_BTT_TABLE}`);
            const totalCount = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalCount / limit);

            // ตรวจสอบว่าหน้าเกิน
            if (page > totalPages || page <= 0) {
                return {
                    message: `Page ${page} is out of range. Total pages: ${totalPages}`,
                    totalPages,
                    totalCount,
                    data: [],
                };
            }

            const sql = `
                SELECT ${selectedFields}
                FROM ${process.env.IDC_BTT_TABLE}
                LIMIT $1 OFFSET $2
            `;
            let { rows } = await pool.query(sql, [limit, offset]);
            rows = rows.map((row) => {
                // Convert unixtime to date
                if (row.time) {
                    row.time = formatUnixToDate(row.time);
                }
                // Convert create_at_bi to date
                if (row.create_at_bi) {
                    row.create_at_bi = formatUnixToDate(row.create_at_bi);
                }
                if (row.unixtime) {
                    row.unixtime = formatUnixToDate(row.unixtime);
                }
                return row;
            });
            return {
                message: "Success",
                totalPages,
                totalCount,
                datacount: rows.length,
                data: rows,
            };
        },
        
    },

    Mutation: {
        create_idc_btt: async (_, args) => {
            const { device_name, unit, unixtime, time, value } = args;

            // Get the last inserted ID
            const sql_id = `
                SELECT id
                FROM ${process.env.IDC_BTT_TABLE}
                ORDER BY id DESC
                LIMIT 1
            `;
            const { rows: idRows } = await pool.query(sql_id);
            const lastId = idRows.length > 0 ? idRows[0].id : 0;
            const newId = lastId + 1;

            // Insert new record
            const sql = `
                INSERT INTO ${process.env.IDC_BTT_TABLE}
                (id, device_name, unit, unixtime, time, value, create_at_bi)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING *
            `;

            let { rows } = await pool.query(sql, [
                newId,
                device_name,
                unit || null,
                unixtime || null,
                time || null,
                value || null
            ]);
            rows = rows.map((row) => {
                // Convert unixtime to date
                if (row.time) {
                    row.time = formatUnixToDate(row.time);
                }
                // Convert create_at_bi to date
                if (row.create_at_bi) {
                    row.create_at_bi = formatUnixToDate(row.create_at_bi);
                }
                if (row.unixtime) {
                    row.unixtime = formatUnixToDate(row.unixtime);
                }
                return row;
            });

            return { message: "Created", data: rows[0] };
        },
        update_idc_btt: async (_, args) => {
            const { id, device_name, unit, unixtime, time, value } = args;

            // 1. ดึงข้อมูลเดิมก่อน
            const selectSql = `
                SELECT * FROM ${process.env.IDC_BTT_TABLE} WHERE id = $1
            `;
            const { rows: existingRows } = await pool.query(selectSql, [id]);

            if (existingRows.length === 0) {
                return { message: `No data found with id ${id}`, data: null };
            }

            const existing = existingRows[0];

            // 2. ใช้ค่าที่ส่งมา ถ้าไม่ส่งมาให้ใช้ของเดิม
            const updatedDeviceName = device_name !== undefined ? device_name : existing.device_name;
            const updatedUnit = unit !== undefined ? unit : existing.unit;
            const updatedUnixtime = unixtime !== undefined ? unixtime : existing.unixtime;
            const updatedTime = time !== undefined ? time : existing.time;
            const updatedValue = value !== undefined ? value : existing.value;

            // 3. อัปเดต
            const updateSql = `
                UPDATE ${process.env.IDC_BTT_TABLE}
                SET device_name = $1,
                    unit = $2,
                    unixtime = $3,
                    time = $4,
                    value = $5,
                    create_at_bi = NOW()
                WHERE id = $6
                RETURNING *
            `;

            let { rows } = await pool.query(updateSql, [
                updatedDeviceName,
                updatedUnit,
                updatedUnixtime,
                updatedTime,
                updatedValue,
                id
            ]);
            rows = rows.map((row) => {
                // Convert unixtime to date
                if (row.time) {
                    row.time = formatUnixToDate(row.time);
                }
                if (row.unixtime) {
                    row.unixtime = formatUnixToDate(row.unixtime);
                }
                // Convert create_at_bi to date
                if (row.create_at_bi) {
                    row.create_at_bi = formatUnixToDate(row.create_at_bi);
                }
                return row;
            });

            return { message: "Updated", data: rows[0] };
        },

        delete_idc_btt: async (_, { id }) => {
            // Delete record
            const sql = `
                DELETE FROM ${process.env.IDC_BTT_TABLE}
                WHERE id = $1
                RETURNING *
            `;

            let { rows } = await pool.query(sql, [id]);
            rows = rows.map((row) => {
                // Convert unixtime to date
                if (row.time) {
                    row.time = formatUnixToDate(row.time);
                }
                if (row.unixtime) {
                    row.unixtime = formatUnixToDate(row.unixtime);
                }
                // Convert create_at_bi to date
                if (row.create_at_bi) {
                    row.create_at_bi = formatUnixToDate(row.create_at_bi);
                }
                return row;
            });

            if (rows.length === 0) {
                return { message: `No data found with id ${id}`, data: null };
            }

            return { message: "Deleted", data: rows[0] };
        },
    },

};

module.exports = resolvers;
