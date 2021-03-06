import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Form, Input, Button, Select, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { updateOperator } from 'redux/actions/RUDoperator'

const { Option } = Select;
const { TextArea } = Input;


const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20, offset: 0 },
};

const layoutWithOutLabel = {
    wrapperCol: { span: 20, offset: 4 },
};

class UpdateForm extends Component {

    libraryData = ['Tensorflow', 'Pytorch'];
    versionData = {
        Tensorflow: ['v2.4', 'v2.3', 'v2.2', 'v2.1', 'v2.0',
            'v1.15', 'v1.14', 'v1.13', 'v1.12', 'v1.11', 'v1.10',
            'v1.9', 'v1.8', 'v1.7', 'v1.6', 'v1.5', 'v1.4', 'v1.3', 'v1.2', 'v1.1', 'v1.0'],
        Pytorch: ['v1.8.0', 'v1.7.1', 'v1.7.0', 'v1.6.0', 'v1.5.1', 'v1.5.0', 'v1.4.0', 'v1.3.1', 'v1.3.0',
            'v1.2.0', 'v1.1.0', 'v1.0.1', 'v1.0.0',
            'v0.4.1', 'v0.4.0', 'v0.3.1', 'v0.3.0', 'v0.2.0', 'v0.1.12',],
    };

    state = {
        library: this.props.initData.library,
        versions: this.versionData[this.props.initData.library],
    }

    onFinish = (values: any) => {
        const { initData } = this.props
        let newParameters = new Array()
        for (var i = 0; i < values.parameters.length; i++) {
            if (i < initData.parameters.length) {
                newParameters.push({
                    ...values.parameters[i],
                    id: initData.parameters[i].id,
                    oid: initData.id
                })
            }
            else newParameters.push({ ...values.parameters[i] })
        }
        const newOperator = {
            ...values,
            id: initData.id,
            parameters: newParameters
        }

        axios.post('/api/operator_management/update_operator', {
            operator: newOperator
        }).then(
            response => {
                const data = response.data.data
                this.props.updateOperator(data.operator)
                PubSub.publish('RUDOperator.Main.OperatorItem.state', { visible: false, modalContent: 'detail' })
                message.success(`???????????????`);
            },
            error => {
                message.error(`???????????????${error.response.statusText}`);
            }
        )
    };

    onFinishFailed = (errorInfo: any) => {
        // console.log('Failed:', errorInfo);
    };

    onRecover = () => {
        this.formRef.setFieldsValue(this.props.initData)
    }

    handleLibraryChange = value => {
        this.setState({
            library: value,
            versions: this.versionData[value],
        })
        this.formRef.setFieldsValue({
            version: undefined
        })
    }

    render() {
        const { library, versions } = this.state
        return (
            <Form
                initialValues={this.props.initData}
                ref={e => this.formRef = e}
                {...layout}
                name="create-operator"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Form.Item label='???' required >
                    <Form.Item
                        name='library'
                        style={{ width: "150px", marginRight: "20px", display: 'inline-block', marginBottom: "0px" }}
                        rules={[{ required: true, whitespace: true, message: "??????????????????", },
                        ]}
                    >
                        <Select placeholder="??????????????????" onChange={this.handleLibraryChange} >
                            {this.libraryData.map((library) => (
                                <Option key={library} >{library}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name='version'
                        style={{ width: "150px", display: 'inline-block', marginBottom: "0px" }}
                        rules={[{ required: true, whitespace: true, message: library == '' ? '?????????????????????' : '?????????????????????' },
                        ]}
                    >
                        <Select placeholder={library == '' ? '?????????????????????' : '?????????????????????'} onChange={this.handleVersionChange} >
                            {versions.map((version) => (
                                <Option key={version} >{version}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form.Item>

                <Form.Item
                    label="????????????"
                    name="name"
                    rules={[{ required: true, message: '????????????????????????' }]}
                >
                    <Input style={{ width: "80%" }} />
                </Form.Item>

                <Form.Item
                    label="????????????"
                    name="input"
                    rules={[{ required: true, message: '????????????????????????' }]}
                >
                    <TextArea rows={4} style={{ width: "80%" }} />
                </Form.Item>

                <Form.Item
                    label="????????????"
                    name="output"
                    rules={[{ required: true, message: '????????????????????????' }]}
                >
                    <TextArea rows={4} style={{ width: "80%" }} />
                </Form.Item>

                <Form.List
                    name="parameters"
                    rules={[{
                        validator: async (_, parameters) => {
                            if (!parameters || parameters.length < 2) {
                                return Promise.reject(new Error('???????????????????????????'));
                            }
                        }
                    }]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    {...(index === 0 ? layout : layoutWithOutLabel)}
                                    label={index === 0 ? '??????' : ''}
                                    key={index}
                                    required
                                >
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'name']}
                                        key={[field.fieldKey, 'name']}
                                        fieldKey={[field.fieldKey, 'name']}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: "?????????????????????????????????????????????",
                                            },
                                        ]}
                                        style={{ width: '23%', marginRight: '2%', display: 'inline-block', marginBottom: "0px" }}
                                    >
                                        <Input placeholder="????????????" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'description']}
                                        key={[field.fieldKey, 'description']}
                                        fieldKey={[field.fieldKey, 'description']}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: "?????????????????????????????????????????????",
                                            },
                                        ]}
                                        style={{ width: "55%", marginRight: '8px', display: 'inline-block', marginBottom: "0px" }}
                                    >
                                        <TextArea placeholder="????????????" rows={4} />
                                    </Form.Item>
                                    <MinusCircleOutlined
                                        className="dynamic-delete-button"
                                        onClick={() => remove(field.name)}
                                        style={{ fontSize: '24px' }}
                                    />
                                </Form.Item>
                            ))}
                            <Form.Item {...layoutWithOutLabel}>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    style={{ width: '80%' }}
                                    icon={<PlusOutlined />}
                                >
                                    ????????????
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item {...layoutWithOutLabel}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: "20px" }}>??????</Button>
                    <Button htmlType="button" onClick={this.onRecover}>??????</Button>
                </Form.Item>

            </Form>


        )
    }
}

export default connect(
    state => ({}),
    {
        updateOperator
    }
)(UpdateForm)