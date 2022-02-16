import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Card, Checkbox, Row, Col, Button, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Detail from './Detail'
import UpdateForm from './UpdateForm'
import { setMutateMethods, updateMutateMethod, setPagination, } from 'redux/actions/mutateMethod'

const { confirm } = Modal;

class MutateMethodItem extends Component {

    state = {
        visible: false,
        modalContent: 'detail'
    }

    showModal = () => {
        this.setState({ visible: true });
    };

    hideModal = () => {
        this.setState({ visible: false });
    };

    afterLoading = (response, current) => {
        this.props.setPagination({
            pageIndex: current,
            totalPages: response.data.data.total_pages
        })
    }

    handleDetail = (event) => {
        this.setState({ modalContent: 'detail' })
        this.showModal()
    }

    handleUpdate = (event) => {
        this.setState({ modalContent: 'update' })
        this.showModal()
        event.stopPropagation()
    }

    handleClickChecked = (event) => {
        axios.post('/api/test_system/mutate_method/update', {
            mutate_method: { ...this.props.item, checked: event.target.checked }
        }).then(
            response => this.props.updateMutateMethod({ ...this.props.item, checked: !event.target.checked }),
            error => message.error(`选中失败,${error.response.statusText}`)
        )
        event.stopPropagation()
    }

    handleDelete = id => (event) => {
        const { pageIndex } = this.props.pagination
        const { setMutateMethods } = this.props
        const afterLoading = this.afterLoading
        confirm({
            title: '确定删除这个方法么？',
            icon: <ExclamationCircleOutlined />,
            okText: '是',
            okType: 'danger',
            cancelText: '否',
            onOk() {
                axios.post("/api/test_system/mutate_method/delete", {
                    id
                }).then(
                    response => {
                        axios.post("/api/test_system/mutate_method/get_page", {
                            page_index: pageIndex,
                            page_size: 25
                        }).then(
                            response => {
                                const data = response.data.data
                                setMutateMethods(data.mutate_methods)
                                afterLoading(response, pageIndex)
                                message.success(`数据变异方法删除成功。`)
                            },
                            error => afterLoading(error.response, pageIndex)
                        )
                    },
                    error => message.error(`删除失败,${error.response.statusText}`)
                )
            },
            onCancel() { },
        });
        event.stopPropagation()
    }

    componentDidMount() {
        PubSub.subscribe('mutateMethod.Main.MutateMethodItem.state', (_, data) => {
            this.setState(data)
        })
    }

    render() {
        const { item, bordered } = this.props

        return (
            <>
                <Card style={{ width: "100%" }} hoverable="true" size="small" bordered={bordered} onClick={this.handleDetail}>
                    <Row>
                        <Col span={2}>
                            <Checkbox
                                checked={item.checked}
                                onClick={this.handleClickChecked}
                            />
                        </Col>
                        <Col span={4}>
                            <div className="item-description-line">{item.name}</div>
                        </Col>
                        <Col span={15}>
                            <div className="item-description-line">{item.url}</div>
                        </Col>
                        <Col span={3}>
                            <Button type="primary" size="small" onClick={this.handleUpdate}>修改</Button>&nbsp;
                        <Button type="primary" size="small" danger onClick={this.handleDelete(item.id)}>删除</Button>
                        </Col>
                    </Row>
                </Card>
                <Modal
                    title={
                        this.state.modalContent == 'detail' ? '方法详细信息' :
                            this.state.modalContent == 'update' ? '修改方法信息' : 'null'
                    }
                    width={
                        this.state.modalContent == 'detail' ? '73%' :
                            this.state.modalContent == 'update' ? '40%' : 'null'
                    }
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
    state => ({ pagination: state.MutateMethod.pagination }),
    {
        setMutateMethods,
        updateMutateMethod,
        setPagination,
    }
)(MutateMethodItem)
