/* eslint-disable no-process-env */
const {
    SQL_USER_TABLE,
    IS_WORKER
} = process.env

module.exports = {
    SQL_USER_TABLE,
    IS_WORKER,
    FEATURE_LIST_AUDIENCES: process.env.FEATURE_LIST_AUDIENCES
        ? !!Number(process.env.FEATURE_LIST_AUDIENCES)
        : true
}
