import {
    SET_RUD_OPERATOR_OPERATORS,
    APPEND_RUD_OPERATOR_OPERATOR,
    UPDATE_RUD_OPERATOR_OPERATOR,
    SET_RUD_OPERATOR_SEARCH,
    SET_RUD_OPERATOR_PAGINATION,
} from 'redux/constant'

export const setOperators = data => ({ type: SET_RUD_OPERATOR_OPERATORS, data })
export const appendOperator = data => ({ type: APPEND_RUD_OPERATOR_OPERATOR, data })
export const updateOperator = data => ({ type: UPDATE_RUD_OPERATOR_OPERATOR, data })
export const setSearch = data => ({ type: SET_RUD_OPERATOR_SEARCH, data })
export const setPagination = data => ({ type: SET_RUD_OPERATOR_PAGINATION, data })
