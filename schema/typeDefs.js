const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type IDC_BTT {
    id: Int
    device_name: String
    unit: String
    unixtime: Float
    time: String
    value: Float
    create_at_bi: String
  }

  type GetIDCResponse {
    message: String
    data: IDC_BTT
  }

  type GetIDCListResponse {
    message: String
    totalPages: Int
    totalCount: Int
    data: [IDC_BTT]
  }

  type Mutation {
    create_idc_btt(device_name: String,unit:String,unixtime:Float,time:String,value:Float): GetIDCResponse
  }

  type Query {
    get_idc_btt_by_id(id: Int!): GetIDCResponse
    get_idc_btt_by_limit_and_offset(limit: Int!, page: Int!): GetIDCListResponse
  }
`);
