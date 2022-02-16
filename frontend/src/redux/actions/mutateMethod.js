import {
    SET_MUTATE_METHOD_MUTATE_METHODS,
    APPEND_MUTATE_METHOD_MUTATE_METHOD,
    UPDATE_MUTATE_METHOD_MUTATE_METHOD,
    SET_MUTATE_METHOD_ALL_MUTATE_METHODS_CHECKED,
    SET_MUTATE_METHOD_SEARCH,
    SET_MUTATE_METHOD_PAGINATION,
} from 'redux/constant'

export const setMutateMethods = data => ({ type: SET_MUTATE_METHOD_MUTATE_METHODS, data })
export const appendMutateMethod = data => ({ type: APPEND_MUTATE_METHOD_MUTATE_METHOD, data })
export const updateMutateMethod = data => ({ type: UPDATE_MUTATE_METHOD_MUTATE_METHOD, data })
export const setAllMutateMethodsChecked = data => ({ type: SET_MUTATE_METHOD_ALL_MUTATE_METHODS_CHECKED, data })
export const setSearch = data => ({ type: SET_MUTATE_METHOD_SEARCH, data })
export const setPagination = data => ({ type: SET_MUTATE_METHOD_PAGINATION, data })