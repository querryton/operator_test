import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Divider, Form, InputNumber, Select, Button, Space, Progress } from 'antd'
import { setSetting, setState, emptyResults, appendResultsCycle } from 'redux/actions/diffTest'

const { Option } = Select;

const layout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 12 },
};

const progressLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

const sufficiencyLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
}

const tailLayout = {
    wrapperCol: { offset: 2, span: 22 },
};

class Setting extends Component {

    onFinish = (values: any) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    onStartTest = (values) => {
        this.props.setState('start-loading')
        axios.post('/api/test_system/diff_test/start_test', {
            model_name: this.props.modelName,
            dataset_name: this.props.datasetName,
            threshold: 10,
            ...values
        }).then(
            response => {
                this.props.emptyResults()
                this.props.appendResultsCycle(2000)
                this.props.setState('running')
                this.props.setSetting(values)
            },
            error => { }
        )
    }


    onPauseTest = () => {
        axios.post('/api/test_system/diff_test/pause_test').then(
            response => {
                this.props.setState('pause')
            },
            error => { }
        )
    }

    onResumeTest = () => {
        axios.post('/api/test_system/diff_test/resume_test').then(
            response => {
                this.props.setState('running')
            },
            error => { }
        )
    }

    onStopTest = () => {
        this.props.setState('stop-loading')
        axios.post('/api/test_system/diff_test/stop_test').then(
            response => { },
            error => { }
        )
    }

    componentDidMount() {
        PubSub.subscribe('DiffTest.Setting.props.state', (_, data) => {
            this.props.setState(data)
        })
    }

    render() {
        const { state, setting } = this.props
        const { iterate_times } = setting
        const iterate_time = this.props.results.length

        var sufficiency = new Array()
        for (let key in this.props.sufficiency)
            sufficiency.push({
                library: key,
                data: this.props.sufficiency[key]
            })

        return (
            <div>
                <Divider orientation="left">????????????</Divider>
                <Form
                    {...layout}
                    name="basic"
                    initialValues={setting}
                    onFinish={this.onStartTest}
                    onFinishFailed={this.onFinishFailed}
                >
                    <div>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="???1"
                                name="library1"
                                rules={[{ required: true, message: '????????????1!' }]}
                            >
                                <Select disabled={state == 'stop' ? false : true}>
                                    {/* onChange={handleChange} */}
                                    <Option key="tensorflow">Tensorflow</Option>
                                </Select>
                            </Form.Item>
                        </span>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="????????????"
                                name="diff_threshold"
                                rules={[{ required: true, message: '?????????????????????!' }]}
                            >
                                <InputNumber disabled={state == 'stop' ? false : true} />
                            </Form.Item>
                        </span>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="???????????????"
                                name="batch_size"
                                rules={[{ required: true, message: '??????????????????!' }]}
                            >
                                <InputNumber disabled={state == 'stop' ? false : true} />
                            </Form.Item>
                        </span>
                    </div>
                    <div>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="???2"
                                name="library2"
                                rules={[{ required: true, message: '????????????2!' }]}
                            >
                                <Select disabled={state == 'stop' ? false : true}>
                                    {/* onChange={handleChange} */}
                                    <Option key="pytorch">Pytorch</Option>
                                </Select>
                            </Form.Item>
                        </span>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="??????????????????"
                                name="active_value"
                                rules={[{ required: true, message: '???????????????????????????!' }]}
                            >
                                <InputNumber disabled={state == 'stop' ? false : true} step={0.01} />
                            </Form.Item>
                        </span>
                        <span style={{ minWidth: '200px', width: '25%', display: 'inline-block' }}>
                            <Form.Item
                                label="????????????"
                                name="iterate_times"
                                rules={[{ required: true, message: '?????????????????????!' }]}
                            >
                                <InputNumber disabled={state == 'stop' ? false : true} />
                            </Form.Item>
                        </span>
                    </div>
                    <div>
                        <span style={{ minWidth: '200px', width: '75%', display: 'inline-block' }}>
                            <Form.Item {...progressLayout} label="??????">
                                <span><Progress percent={iterate_time * 100 / iterate_times} style={{ width: '100%' }} /></span>
                            </Form.Item>
                        </span>
                        <span style={{ minWidth: '240px', width: '25%', display: 'inline-block' }}>
                            <Form.Item {...tailLayout} >
                                <Space wrap size={10}>
                                    <Button type="primary" htmlType="submit" disabled={state == 'stop' ? false : true} loading={state == 'start-loading' ? true : false}>
                                        ??????
                                </Button>
                                    <Button
                                        onClick={state == 'pause' ? this.onResumeTest : this.onPauseTest}
                                        disabled={state == 'pause' || state == 'running' ? false : true}
                                    >
                                        {state == 'pause' ? '??????' : '??????'}
                                    </Button>
                                    <Button
                                        onClick={this.onStopTest}
                                        disabled={state == 'running' ? false : true}
                                        loading={state == 'stop-loading' ? true : false}
                                    >
                                        ??????
                                </Button>
                                </Space>
                            </Form.Item>
                        </span>
                    </div>
                </Form >

            </div >
        )
    }
}

export default connect(
    state => ({
        state: state.DiffTest.state,
        setting: state.DiffTest.setting,
        modelName: state.CorpusSet.model.name,
        datasetName: state.CorpusSet.dataset,
        results: state.DiffTest.results,
        sufficiency: state.DiffTest.sufficiency

    }),
    {
        setSetting,
        setState,
        emptyResults,
        appendResultsCycle
    }
)(Setting)