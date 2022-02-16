import React, { Component } from 'react'
import { connect } from 'react-redux'
import PubSub from 'pubsub-js'
import { Empty, Skeleton, Result, Modal } from 'antd';
import BugItem from 'components/bugOperation/common/BugItem'
import "./index.css"

class Main extends Component {
    state = {
        loading: false,
        status: {
            statusCode: 200,
            statusText: 'OK'
        },
    }

    componentDidMount() {
        PubSub.subscribe('spider.Main.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const bugs = this.props.bugs
        const { loading } = this.state
        const { statusCode, statusText } = this.state.status
        if (loading == true) {
            return (
                <div>
                    <Skeleton active />
                    <Skeleton active />
                    {/* <Skeleton active />
                    <Skeleton active /> */}
                </div>)
        }
        if (statusCode != 200) {
            return (
                <div style={{ minHeight: 590, width: '100%', display: 'table' }}>
                    <Result
                        style={{ display: 'table-cell', verticalAlign: 'middle' }}
                        status="error"
                        title={statusCode + ''}
                        subTitle={statusText}
                    />
                </div>
            )
        }
        if (bugs.length == 0) {
            return (
                <div style={{ minHeight: 290, width: '100%', display: 'table' }}>
                    <Empty style={{ display: 'table-cell', verticalAlign: 'middle' }} description="暂无数据" />
                </div>
            )
        }
        return bugs.map(item => (<BugItem item={item} key={item.id} />))

    }
}

export default connect(
    state => ({
        bugs: state.Spider.bugs,
    })
)(Main)