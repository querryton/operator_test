import React, { Component } from 'react'
import { Card, Tooltip, Tag, Modal } from 'antd';
import {
    ExclamationCircleOutlined,
    IssuesCloseOutlined
} from '@ant-design/icons';
import Detail from './Detail'

export default class BugItem extends Component {

    state = {
        visible: false,
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    hideModal = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const { item, bordered } = this.props
        return (
            <>
                <Card style={{ width: "100%" }} hoverable="true" size="small" bordered={bordered} onClick={this.showModal}>
                    <span>{
                        item.state == 'open' ?
                            <Tooltip title="Open bug">
                                <ExclamationCircleOutlined style={{ color: 'rgb(34,134,58)' }} />
                            </Tooltip> :
                            <Tooltip title="Closed bug">
                                <IssuesCloseOutlined style={{ color: 'rgb(203,36,49)' }} />
                            </Tooltip>

                    }&nbsp;
                </span>
                    <h2>{item.title}</h2>&nbsp;&nbsp;
                {
                        item.labels.map((label, index) => {
                            return (
                                <Tag color={'#' + label.color + 'C0'} key={index}>{label.name} </Tag>
                            )
                        })
                    }<br />
                    <div className="creater">{item.library}#{item.number} created at {item.created_at}
                        <strong> by {item.author}</strong>
                    </div>
                </Card>
                <Modal
                    title="Bug详细信息"
                    width={'73%'}
                    visible={this.state.visible}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <Detail detail={item}></Detail>
                </Modal>
            </>
        )
    }
}
