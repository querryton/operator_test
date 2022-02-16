import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import fileDownload from "js-file-download";
import { Divider, Form, Progress, Table, Button, Space, Modal } from 'antd'
import TestRecordDetail from './TestRecordDetail'
import './index.css'


const sufficiencyLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
}



const data = []


class ResultSummary extends Component {

    state = {

        tid: 0,
        iterate_time: 0
    }

    showModal = (tid, iterate_time) =>
        () => {
            this.setState({
                tid, iterate_time,
            });
        }

    hideModal = () => {
        this.setState({
            tid: 0,
            iterate_time: 0
        });
    };

    columns = [
        {
            title: '测试次数',
            dataIndex: 'iterate_time',
            key: 'iterate_time',
        },
        {
            title: '层名称',
            dataIndex: 'layer',
            key: 'layer',
        },
        {
            title: '异常值',
            dataIndex: 'suspect_value',
            key: 'suspect_value',
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button style={{ padding: '0px' }} type='link' onClick={this.showModal(record.tid, record.iterate_time)}>查看详情</Button>
                    <Modal
                        title="测试详情"
                        width={'73%'}
                        visible={this.state.tid == record.tid && this.state.iterate_time == record.iterate_time ? true : false}
                        onCancel={this.hideModal}
                        footer={null}
                    >
                        <TestRecordDetail detail={{ tid: this.state.tid, iterate_time: this.state.iterate_time }} />
                    </Modal>
                </>
            ),
        }
    ];

    render() {
        var sufficiency = new Array()
        for (let key in this.props.sufficiency)
            sufficiency.push({
                library: key,
                data: this.props.sufficiency[key]
            })
        return (
            <div>
                <Divider orientation="left">结果摘要</Divider>
                <Form className="diff-test-results-summary-sufficiency">
                    {
                        sufficiency.map(item => {
                            return (
                                <span style={{ minWidth: '200px', width: '75%', height: 'fit-content', display: 'inline-block' }} key={item.library}>
                                    <Form.Item {...sufficiencyLayout} label={"库" + item.library + "测试充分度"}>
                                        <span><Progress percent={item.data * 100} /></span>
                                    </Form.Item>
                                </span>
                            )
                        })
                    }
                </Form>
                <Table style={{ margin: "0 auto", width: "85%" }}
                    // pagination={{ position: ['none', 'none'] }}
                    columns={this.columns}
                    rowKey={record => ""+record.tid+"-"+record.iterate_time+"-"+record.layer}
                    dataSource={this.props.suspects.map((suspect) => {
                        return { ...suspect, layer: this.props.layers[suspect.layer / 2] }
                    })}
                />
            </div >
        )
    }
}

export default connect(
    state => ({
        suspects: state.DiffTest.suspects,
        sufficiency: state.DiffTest.sufficiency,
        layers: state.CorpusSet.model.layers
    }),
    {

    }
)(ResultSummary)
