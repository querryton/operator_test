import {
    SET_SPIDER_BUGS,
    APPEND_SPIDER_BUGS,
    SET_SPIDER_LIBRARY,
    SET_SPIDER_PAGE,
    SET_SPIDER_PAGINATION,
} from 'redux/constant'

export const setBugs = data => ({ type: SET_SPIDER_BUGS, data })
export const appendBugs = data => ({ type: APPEND_SPIDER_BUGS, data })
export const setLibrary = data => ({ type: SET_SPIDER_LIBRARY, data })
export const setPage = data => ({ type: SET_SPIDER_PAGE, data })
export const setPagination = data => ({ type: SET_SPIDER_PAGINATION, data })
