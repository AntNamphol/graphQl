const graphqlFields = require("graphql-fields");

/**
 * รับ info แล้วดึง field ที่ client ขอ
 * ถ้า response wrapper มี field ชื่อ "data" (เช่น { message, data { ... } })
 * ให้ส่ง parentField="data"
 */
function getSelectedFields(info, parentField = "data") {
  if (!info) return "*";            // fallback กันพลาด
  const fields = graphqlFields(info);
  const target =
    parentField && fields[parentField] ? fields[parentField] : fields;
  const selected = Object.keys(target);
  return selected.length ? selected.join(", ") : "*";
}

module.exports = getSelectedFields;
