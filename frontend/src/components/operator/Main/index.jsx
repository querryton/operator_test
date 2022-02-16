import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Skeleton, Result, Empty, Row, Col, Modal } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import OperatorItem from './OperatorItem'
import { setOperators, setPagination } from 'redux/actions/RUDoperator'
import './index.css'

class Main extends Component {
    state = {
        loading: false,
        status: {
            statusCode: 200,
            statusText: 'OK'
        }
    }

    afterLoading = (response) => {
        this.setState({
            loading: false,
            status: {
                statusCode: response.status,
                statusText: response.statusText
            }
        })
    }

    componentDidMount() {
        const operators = this.props.operators
        if (operators.length == 0) {
            this.setState({ loading: true })
            axios.post('/api/operator_management/get_operator_page', {
                page_index: 1,
                page_size: 25
            }).then(
                response => {
                    const data = response.data.data
                    this.props.setOperators(data.operators)
                    this.props.setPagination({
                        pageIndex: 1,
                        totalPages: data.total_pages
                    })
                    this.afterLoading(response)
                },
                error => this.afterLoading(error.response)
            )
        }
        PubSub.subscribe('RUDOperation.Main.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { loading } = this.state
        const { statusCode, statusText } = this.state.status
        const operators = this.props.operators
        if (loading == true) {
            return (
                <div>
                    <Skeleton active />
                    <Skeleton active />
                    <Skeleton active />
                    <Skeleton active />
                </div>)
        }
        if (statusCode != 200) {
            return (
                <div style={{ minHeight: 600, width: '100%', display: 'table' }}>
                    <Result
                        style={{ display: 'table-cell', verticalAlign: 'middle' }}
                        status="error"
                        title={statusCode + ''}
                        subTitle={statusText}
                    />
                </div>
            )
        }
        if (operators.length == 0) {
            return (
                <div style={{ minHeight: 600, width: '100%', display: 'table' }}>
                    <Empty style={{ position: 'relative', display: 'table-cell', verticalAlign: 'middle' }} description="暂无数据" />
                </div>
            )
        }
        return (
            <div>
                <div className="operator-item-header">
                    <Row>
                        <Col span={2}>
                            <span className="icon"><GithubOutlined /></span>
                            <span className="library">库</span>
                        </Col>
                        <Col span={2}>版本</Col>
                        <Col span={5}>算子</Col>
                        <Col span={5}>输入</Col>
                        <Col span={5}>输出</Col>
                        <Col span={2}>参数个数</Col>
                        <Col span={3}>操作</Col>
                    </Row>
                </div>
                {operators.map(operator => (<OperatorItem item={operator} key={operator.id} />))}
                {/* <Modal
                    title={
                        this.state.modalContent == 'retrieve' ? '算子详细信息' :
                            this.state.modalContent == 'update' ? '修改算子信息' : 'null'
                    }
                    width={'73%'}
                    visible={this.state.visible}
                    onCancel={this.hide}
                    footer={null}
                >
                    {
                        this.state.modalContent == 'retrieve' ?
                            <Detail detail={this.state.detail} /> :
                            this.state.modalContent == 'update' ?
                                <UpdateForm initData={this.state.detail} /> : 'null'
                    }
                </Modal> */}
            </div>
        )
    }
}

export default connect(
    state => ({ operators: state.RUDOperator.operators }),
    {
        setOperators,
        setPagination
    }
)(Main)
