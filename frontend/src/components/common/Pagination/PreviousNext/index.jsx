import React, { Component } from 'react'
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

export default class PreviousNext extends Component {
    render() {
        const { current, totalPages, setCurrent } = this.props
        return (
            <div className={this.props.className}>
                <Button
                    type="text"
                    onClick={setCurrent(current - 1)}
                    disabled={current == 1 ? true : false}
                >
                    <LeftOutlined />上一页
                </Button>
                {this.props.children}
                <Button
                    type="text"
                    onClick={setCurrent(current + 1)}
                    disabled={current == totalPages ? true : false}
                >
                    下一页<RightOutlined />
                </Button>
            </div>
        )
    }
}