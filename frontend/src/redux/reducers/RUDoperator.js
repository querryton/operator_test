import {
    SET_RUD_OPERATOR_OPERATORS,
    APPEND_RUD_OPERATOR_OPERATOR,
    UPDATE_RUD_OPERATOR_OPERATOR,
    SET_RUD_OPERATOR_SEARCH,
    SET_RUD_OPERATOR_PAGINATION,
} from 'redux/constant'

const init = {
    operators: [],
    search: {
        field: 'name',
        keywords: ''
    },
    pagination: {
        pageIndex: 0,
        totalPages: 0,
    }
}

export default function RUDoperatorReducer(pre = init, action) {
    const { type, data } = action

    switch (type) {
        case SET_RUD_OPERATOR_OPERATORS:
            return {
                ...pre,
                operators: data
            }
        case APPEND_RUD_OPERATOR_OPERATOR:
            return {
                ...pre,
                operators: [...pre.operators, data]
            }
        case UPDATE_RUD_OPERATOR_OPERATOR:
            return {
                ...pre,
                operators: pre.operators.map((operator) => {
                    if (operator.id == data.id)
                        return data
                    return operator
                })
            }
        case SET_RUD_OPERATOR_SEARCH:
            return {
                ...pre,
                search: data
            }
        case SET_RUD_OPERATOR_PAGINATION:
            return {
                ...pre,
                pagination: data
            }
        default:
            return pre;
    }
}
