import React, { Component } from 'react'
import { connect } from 'react-redux'
import PubSub from 'pubsub-js'
import { Card, Collapse, Empty, Skeleton, Result, Modal } from 'antd';
import { AlignLeftOutlined } from '@ant-design/icons';
import BugItem from 'components/bugOperation/common/BugItem'
import './index.css'

const { Panel } = Collapse;

class Main extends Component {
    state = {
        classifying: false,
        status: {
            statusCode: 200,
            statusText: 'OK'
        },
    }

    componentDidMount() {
        PubSub.subscribe('classifier.Main.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { categorys, results } = this.props
        const { classifying } = this.state
        const { statusCode, statusText } = this.state.status
        if (classifying == true) {
            return (
                <div>
                    <Skeleton active />
                    <Skeleton active />
                    {/* <Skeleton active />
                    <Skeleton active /> */}
                </div>
            )
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
        if (categorys.length == 0) {
            return (
                <div style={{ minHeight: 290, width: '100%', display: 'table' }}>
                    <Empty style={{ display: 'table-cell', verticalAlign: 'middle' }} description="暂无数据" />
                </div>
            )
        }
        return (
            <div>
                <div className="collapse-header">
                    <span className="icon"><AlignLeftOutlined /></span>
                    <span className="category">类别名称</span>
                    <span className="number">数量</span>
                </div>
                <Collapse className="collapse-classify-result" accordion bordered={false}>
                    {categorys.map((category, index) => (
                        <Panel
                            header={category == "null" ? "Others" : category}
                            key={index}
                            extra={results[category].length}
                        >
                            {results[category].map((result) => (<BugItem item={result} bordered={false} key={result.id} />))}
                        </Panel>
                    ))}
                </Collapse>
            </div>
        )
    }
}

export default connect(
    state => ({
        categorys: state.Classifier.categorys,
        results: state.Classifier.results,
    }),
    {}
)(Main)
