const filterMaps = jest.requireActual('@taplytics/filter-maps')
const utils = jest.requireActual('@taplytics/filter-maps/src/utils')

utils.getFilterMap = () => ([
    {
        key: 'string_table.string_column',
        table: 'string_table',
        column: 'string_column',
        dataType: 'varchar',
        type: 'table'
    },
    {
        key: 'string_table.string_column_AVG',
        table: 'string_table',
        column: 'string_column',
        dataType: 'varchar',
        type: 'table',
        isAgg: true
    },
    {
        key: 'long_table.long_column',
        table: 'long_table',
        column: 'long_column',
        dataType: 'long',
        type: 'table'
    },
    {
        key: 'int_table.int_column',
        table: 'int_table',
        column: 'int_column',
        dataType: 'int',
        type: 'table'
    },
    {
        key: 'boolean_table.boolean_column',
        table: 'boolean_table',
        column: 'boolean_column',
        dataType: 'bool',
        type: 'table'
    },
    {
        key: 'date_table.date_column',
        table: 'date_table',
        column: 'date_column',
        dataType: 'timestamp',
        type: 'table'
    },
    {
        type: 'user',
        subType: 'customData',
        dataType: 'json'
    },
    {
        type: 'user',
        subType: 'otherJson',
        dataType: 'json'
    }
])

module.exports = {
    ...filterMaps
}
