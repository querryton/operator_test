import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import PreviousNext from './PreviousNext'
import './index.css'

export default class Pagination extends Component {


    render() {
        const { pageIndex: current, totalPages, setCurrentPage } = this.props
        var { count } = this.props
        if (count == undefined)
            count = 5

        let pageIndexs = []
        const begin = current - (count - 1) / 2
        const end = current + (count - 1) / 2
        if (begin - 2 > 2) {
            for (var i = 0; i < 3 + (count + 1) / 2; i++) {
                if (i == 2) pageIndexs.push(-1)
                else if (i < 2) pageIndexs.push(i + 1)
                else pageIndexs.push(begin + (i - 3))
            }
        }
        else {
            for (var i = 0; i < current; i++)
                pageIndexs.push(i + 1)
        }

        if (totalPages - 1 - end > 2) {
            for (var i = 0; i < 3 + (count - 1) / 2; i++) {
                if (i == (count - 1) / 2) pageIndexs.push(-1)
                else if (i < (count - 1) / 2) pageIndexs.push(current + 1 + i)
                else pageIndexs.push(totalPages + i - 4)
            }
        }
        else {
            for (var i = 0; i < 2 + (count - 1) / 2 && current + 1 + i <= totalPages; i++) {
                pageIndexs.push(current + 1 + i)
            }
        }

        return (
            <PreviousNext className="pagination" current={current} totalPages={totalPages} setCurrent={setCurrentPage} >
                {pageIndexs.map((pageIndex, index) => {
                    return (
                        pageIndex == -1 ?
                            <span className="gap" key={index}>...</span> :
                            <Button
                                type={current == pageIndex ? 'primary' : 'text'}
                                key={index}
                                onClick={setCurrentPage(pageIndex)}
                            >
                                {pageIndex}
                            </Button>
                    )
                })}
            </PreviousNext>
        )
    }
}