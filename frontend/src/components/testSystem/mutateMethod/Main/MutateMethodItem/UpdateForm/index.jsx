import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Input, Select, Form, Button, message } from 'antd'
import { updateMutateMethod } from 'redux/actions/mutateMethod'

const { Option } = Select;

const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 21 },
};
const tailLayout = {
    wrapperCol: { offset: 3, span: 21 },
};

class UpdataForm extends Component {

    constructor(props) {
        super(props)
        this.initData = {
            ...this.props.initData,
            protocol: new URL(props.initData.url).protocol + "//",
            pathname: props.initData.url.substring(props.initData.url.indexOf('//') + 2, props.initData.url.length)
        }
        delete this.initData.url
    }

    selectBefore = (
        <Form.Item name="protocol" rules={[{ required: true }]} noStyle>
            <Select className="protocol-select-before" >
                <Option value="http://">http://</Option>
                <Option value="https://">https://</Option>
            </Select>
        </Form.Item>
    );

    onRecover = () => {
        this.formRef.setFieldsValue(this.initData)
    }


    onFinish = (values: any) => {
        const { initData } = this
        const newMutateMethod = {
            ...values,
            url: values.protocol + values.pathname,
            id: initData.id,
        }
        delete newMutateMethod.protocol
        delete newMutateMethod.pathname
        axios.post('/api/test_system/mutate_method/update', {
            mutate_method: newMutateMethod
        }).then(
            response => {
                const status = response.data.status
                console.log(status.code);
                if (status.code == 100007)
                    message.error('该URL对应的方法已经存在。');
                else {
                    const data = response.data.data
                    this.props.updateMutateMethod(data.mutate_method)
                    PubSub.publish('mutateMethod.Main.MutateMethodItem.state', { visible: false })
                    message.success(`修改成功。`);
                }

            },
            error => {
                message.error(`修改失败，${error.response.statusText}`);
            }
        )
    };

    onFinishFailed = (errorInfo: any) => {
        // console.log('Failed:', errorInfo);
    };

    render() {
        return (
            <Form
                initialValues={this.initData}
                ref={e => this.formRef = e}
                {...layout}
                name="control-ref"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Form.Item name="name" label="方法名称" rules={[{ required: true, message: "请输入方法名称" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="pathname" label="接口URL" rules={[{ required: true, message: "请输入接口URL" }]}>
                    <Input addonBefore={this.selectBefore} />
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">修改 </Button>
                    <Button htmlType="button" onClick={this.onRecover}>恢复 </Button>
                </Form.Item>
            </Form>
        )
    }
}

export default connect(
    state => ({}),
    {
        updateMutateMethod
    }
)(UpdataForm)