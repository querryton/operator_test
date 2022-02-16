import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Form, Input, Button, Select, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { appendOperator } from 'redux/actions/RUDoperator'

const { Option } = Select;
const { TextArea } = Input;


const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20, offset: 0 },
};

const layoutWithOutLabel = {
    wrapperCol: { span: 20, offset: 4 },
};

class CreateOperator extends Component {

    libraryData = ['Tensorflow', 'Pytorch'];
    libraryVersionData = {
        Tensorflow: ['v2.4', 'v2.3', 'v2.2', 'v2.1', 'v2.0',
            'v1.15', 'v1.14', 'v1.13', 'v1.12', 'v1.11', 'v1.10',
            'v1.9', 'v1.8', 'v1.7', 'v1.6', 'v1.5', 'v1.4', 'v1.3', 'v1.2', 'v1.1', 'v1.0'],
        Pytorch: ['v1.8.0', 'v1.7.1', 'v1.7.0', 'v1.6.0', 'v1.5.1', 'v1.5.0', 'v1.4.0', 'v1.3.1', 'v1.3.0',
            'v1.2.0', 'v1.1.0', 'v1.0.1', 'v1.0.0',
            'v0.4.1', 'v0.4.0', 'v0.3.1', 'v0.3.0', 'v0.2.0', 'v0.1.12',],
    };

    state = {
        library: '',
        libraryVersion: [],
    }

    onFinish = (values: any) => {
        axios.post('/api/operator_management/create_operator', {
            operator: values
        }).then(
            response => {
                const data = response.data.data
                this.props.appendOperator(data.operator)
                this.props.hideModal()
                setTimeout(this.formRef.resetFields, 5)
                message.success(`算子${data.operator.name}添加成功。`);
            },
            error => {
                message.error(`添加失败，${error.response.statusText}`);
            }
        )
    };

    onFinishFailed = (errorInfo: any) => {
        // console.log('Failed:', errorInfo);
    };

    onReset = () => {
        this.formRef.resetFields();
    };

    handleLibraryChange = value => {
        this.setState({
            library: value,
            libraryVersion: this.libraryVersionData[value]
        })
    }

    render() {
        const { library, libraryVersion } = this.state

        return (
            <Form
                ref={e => this.formRef = e}
                {...layout}
                name="create-operator"
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
            >
                <Form.Item
                    label='库'
                    required
                >
                    <Form.Item
                        name='library'
                        style={{ width: "150px", marginRight: "20px", display: 'inline-block', marginBottom: "0px" }}
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: "请选择一个库",
                            },
                        ]}
                    >
                        <Select placeholder="请选择一个库" onChange={this.handleLibraryChange} >
                            {this.libraryData.map((library, index) => (
                                <Option key={index} value={library}>{library}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name='version'
                        style={{ width: "150px", display: 'inline-block', marginBottom: "0px" }}
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: library == '' ? '请先选择一个库' : '请选择一个版本'
                            },
                        ]}
                    >
                        <Select placeholder={library == '' ? '请先选择一个库' : '请选择一个版本'} value={libraryVersion[0]}>
                            {libraryVersion.map((libraryVersion, index) => (
                                <Option key={index} value={libraryVersion}>{libraryVersion}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form.Item>

                <Form.Item
                    label="算子名称"
                    name="name"
                    rules={[{ required: true, message: '请输入算子名称。' }]}
                >
                    <Input style={{ width: "80%" }} />
                </Form.Item>

                <Form.Item
                    label="输入描述"
                    name="input"
                    rules={[{ required: true, message: '请输入输入描述。' }]}
                >
                    <TextArea rows={4} style={{ width: "80%" }} />
                </Form.Item>

                <Form.Item
                    label="输出描述"
                    name="output"
                    rules={[{ required: true, message: '请输入输出描述。' }]}
                >
                    <TextArea rows={4} style={{ width: "80%" }} />
                </Form.Item>

                <Form.List
                    name="parameters"
                    rules={[
                        {
                            validator: async (_, parameters) => {
                                if (!parameters || parameters.length < 2) {
                                    return Promise.reject(new Error('至少填写两个参数。'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map((field, index) => (
                                <Form.Item
                                    {...(index === 0 ? layout : layoutWithOutLabel)}
                                    label={index === 0 ? '参数' : ''}
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
                                                message: "请输入参数名称或删除这个字段。",
                                            },
                                        ]}
                                        style={{ width: '23%', marginRight: '2%', display: 'inline-block', marginBottom: "0px" }}
                                    >
                                        <Input placeholder="参数名称" />
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
                                                message: "请输入参数描述或删除这个字段。",
                                            },
                                        ]}
                                        style={{ width: "55%", marginRight: '8px', display: 'inline-block', marginBottom: "0px" }}
                                    >
                                        <TextArea placeholder="参数描述" rows={4} />
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
                                    添加参数
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item {...layoutWithOutLabel}>
                    <Button type="primary" htmlType="submit" style={{ marginRight: "20px" }}> 添加</Button>
                    <Button htmlType="button" onClick={this.onReset}>清空 </Button>
                </Form.Item>

            </Form>


        )
    }
}

export default connect(
    state => ({ }),
    {
        appendOperator,
    }
)(CreateOperator)
