const pool = require("../db");
const getSelectedFields = require("../utils/getSelectedFields");

const resolvers = {
    Query: {
        get_idc_btt_by_id: async (_, { id }, __, info) => {
            const selectedFields = getSelectedFields(info);
            const sql = `
                        SELECT ${selectedFields}
                        FROM ${process.env.IDC_BTT_TABLE}
                        WHERE id = $1
                    `;
            const { rows } = await pool.query(sql, [id]);

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
                ORDER BY id DESC
                LIMIT $1 OFFSET $2
            `;
            const { rows } = await pool.query(sql, [limit, offset]);

            return {
                message: "Success",
                totalPages,
                totalCount,
                data: rows,   
            };
        },
    },

    Mutation: {
        create_idc_btt: async (_, args) => {
            const { device_name, unit, unixtime, time, value } = args;
            const sql = `
                    INSERT INTO ${process.env.IDC_BTT_TABLE}
                    (device_name, unit,unixtime,time, value,create_at_bi)
                    VALUES ($1, $2, $3, $4,$5,NOW())
                    RETURNING *
                `;
            const { rows } = await pool.query(sql, [
                device_name,
                unit || null,
                value || null,
                unixtime || null,
                time || null,
            ]);
            return { message: "Created", data: rows[0] };
        },
    },
};

module.exports = resolvers;
