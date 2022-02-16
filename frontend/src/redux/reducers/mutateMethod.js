import {
    SET_MUTATE_METHOD_MUTATE_METHODS,
    APPEND_MUTATE_METHOD_MUTATE_METHOD,
    UPDATE_MUTATE_METHOD_MUTATE_METHOD,
    SET_MUTATE_METHOD_ALL_MUTATE_METHODS_CHECKED,
    SET_MUTATE_METHOD_SEARCH,
    SET_MUTATE_METHOD_PAGINATION,
} from 'redux/constant'

const init = {
    mutateMethods: [],
    search: {
        field: 'name',
        keywords: ''
    },
    pagination: {
        pageIndex: 0,
        totalPages: 0,
    }
}

export default function mutateMethodReducer(pre = init, action) {
    const { type, data } = action
    switch (type) {
        case SET_MUTATE_METHOD_MUTATE_METHODS:
            return {
                ...pre,
                mutateMethods: data
            }
        case APPEND_MUTATE_METHOD_MUTATE_METHOD:
            return {
                ...pre,
                mutateMethods: [...pre.mutateMethods, data]
            }
        case UPDATE_MUTATE_METHOD_MUTATE_METHOD:
            return {
                ...pre,
                mutateMethods: pre.mutateMethods.map(mutateMethod => {
                    if (mutateMethod.id == data.id)
                        return data
                    return mutateMethod
                })
            }
        case SET_MUTATE_METHOD_ALL_MUTATE_METHODS_CHECKED:
            return {
                ...pre,
                mutateMethods: pre.mutateMethods.map(mutateMethod => {
                    return {...mutateMethod, checked: data }
                })
            }
        case SET_MUTATE_METHOD_SEARCH:
            return {
                ...pre,
                search: data
            }
        case SET_MUTATE_METHOD_PAGINATION:
            return {
                ...pre,
                pagination: data
            }
        default:
            return pre
    }
}