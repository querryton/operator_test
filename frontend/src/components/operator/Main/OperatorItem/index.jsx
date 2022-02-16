import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Card, Modal, Row, Col, Button, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Detail from './Detail'
import UpdateForm from './UpdateForm'
import {
    setOperators,
    setPagination,
} from 'redux/actions/RUDoperator'
import './index.css'

const { confirm } = Modal;

class OperatorItem extends Component {

    state = {
        visible: false,
        modalContent: 'detail'
    }

    showModal = () => {
        this.setState({ visible: true });
    };

    hideModal = () => {
        this.setState({ visible: false });
        this.setState({ modalContent: 'detail' })
    };

    afterLoading = (response, current) => {
        this.props.setPagination({
            pageIndex: current,
            totalPages: response.data.data.total_pages
        })
    }

    hadleUpdate = (params) => {
        this.setState({ modalContent: 'update' })
        this.showModal()
    }

    handleDelete = id => (event) => {
        const { pageIndex } = this.props.pagination
        const { setOperators } = this.props
        const afterLoading = this.afterLoading
        confirm({
            title: '确定删除这个算子么？',
            icon: <ExclamationCircleOutlined />,
            okText: '是',
            okType: 'danger',
            cancelText: '否',
            onOk() {
                axios.post("/api/operator_management/delete_operator", {
                    id
                }).then(
                    response => {
                        axios.post("/api/operator_management/get_operator_page", {
                            page_index: pageIndex,
                            page_size: 25
                        }).then(
                            response => {
                                const data = response.data.data
                                setOperators(data.operators)
                                afterLoading(response, pageIndex)
                                message.success(`算子删除成功。`)
                            },
                            error => afterLoading(error.response, pageIndex)
                        )
                    },
                    error => message.error(`删除失败${error.response.statusText}`)
                )
            },
            onCancel() { },
        });
        event.stopPropagation()
    }

    componentDidMount() {
        PubSub.subscribe('RUDOperator.Main.OperatorItem.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { item, bordered } = this.props
        return (
            <>
                <Card style={{ width: "100%" }} hoverable="true" size="small" bordered={bordered} onClick={this.showModal}>
                    <Row>
                        <Col span={2}>
                            <strong>{item.library}</strong>&nbsp;&nbsp;
                    </Col>
                        <Col span={2}>{item.version}</Col>
                        <Col span={5}>
                            <div className="operator-item-description-line"> {item.name}</div>
                        </Col>
                        <Col span={5}>
                            <div className="operator-item-description-line">{item.input}</div>
                        </Col>
                        <Col span={5}>
                            <div className="operator-item-description-line">{item.output}</div>
                        </Col>
                        <Col span={2}>{item.parameters.length}</Col>
                        <Col span={3}>
                            <Button type="primary" size="small" onClick={this.hadleUpdate}>修改</Button>&nbsp;
                        <Button type="primary" size="small" danger onClick={this.handleDelete(item.id)}>删除</Button>
                        </Col>
                    </Row>
                </Card>

                <Modal
                    title={
                        this.state.modalContent == 'detail' ? '算子详细信息' :
                            this.state.modalContent == 'update' ? '修改算子信息' : 'null'
                    }
                    width={'73%'}
                    visible={this.state.visible}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    {
                        this.state.modalContent == 'detail' ?
                            <Detail detail={item} /> :
                            this.state.modalContent == 'update' ?
                                <UpdateForm initData={item} /> : 'null'
                    }
                </Modal>
            </>
        )
    }
}

export default connect(
    state => ({ pagination: state.RUDOperator.pagination }),
    {
        setOperators,
        setPagination,
    }
)(OperatorItem)
