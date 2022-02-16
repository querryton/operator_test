import {
    SET_SPIDER_BUGS,
    APPEND_SPIDER_BUGS,
    SET_SPIDER_LIBRARY,
    SET_SPIDER_PAGE,
    SET_SPIDER_PAGINATION,
} from 'redux/constant'

const init = {
    bugs: [],
    library: undefined,
    page: 0,
    pagination: {
        pageIndex: 0,
        totalPages: 0,
    }

}

export default function spiderReducer(pre = init, action) {
    const { type, data } = action
    switch (type) {
        case SET_SPIDER_BUGS:
            return {
                ...pre,
                bugs: data,
            }
        case APPEND_SPIDER_BUGS:
            return {
                ...pre,
                bugs: [...pre.bugs, ...data],
            }
        case SET_SPIDER_LIBRARY:
            return {
                ...pre,
                library: data,
            }
        case SET_SPIDER_PAGE:
            return {
                ...pre,
                page: data,
            }
        case SET_SPIDER_PAGINATION:
            return {
                ...pre,
                pagination: data
            }
        default:
            return pre
    }
}