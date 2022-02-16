import React, { Component } from 'react'
import axios from 'axios'
import { Upload, Tabs, Button, Input, Image, message, Spin } from 'antd';
import { UploadOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './index.css'

const { TabPane } = Tabs;
const { TextArea } = Input;

export default class Detail extends Component {


    state = {
        fileList: [],
        originalImage: '',
        mutateImage: '',
        mutateCustomData: ''
    }

    onVerifyMutateMethod = () => {
        axios.post('/api/test_system/mutate_method/verify', {
            mutate_method: this.props.detail
        }).then(
            response => {
                const data = response.data.data
                if (data.state == true)
                    message.success('该变异方法符合要求。')
                else message.error(data.error)

            },
            error => message.error(error.response.status + ":" + error.response.statusText)

        )
    }

    onCustomDataMutate = () => {
        const { value } = this.originalDataRef.resizableTextArea.props
        try {
            var jsonObj = JSON.parse(value)
            if (!(jsonObj instanceof Array)) {
                message.error("输入的数据不合法，请输入数组格式的数据。")
                return false
            }
            axios.post('/api/test_system/mutate_method/verify', {
                mutate_method: this.props.detail
            }).then(
                response => {
                    const data = response.data.data
                    if (data.state != true) {
                        this.setState({ mutateImage: 'error' })
                        message.error(data.error)
                        return false
                    }
                    axios.post('/api/test_system/mutate_method/data_list_mutate', {
                        data: jsonObj,
                        url: this.props.detail.url
                    }).then(
                        response => this.setState({ mutateCustomData: JSON.stringify( response.data.data )}),
                        error => message.error(error.response.status + ":" + error.response.statusText)
                    )
                },
                error => {
                    this.setState({ mutateImage: 'error' })
                    message.error(error.response.status + ":" + error.response.statusText)
                }
            )
        } catch (e) {
            message.error("输入的数据不合法，请输入数组格式的数据。")
        }
    }

    callback = (key) => {
        // console.log(key);
    }

    render() {
        const { detail } = this.props
        const { fileList } = this.state;

        const uploadProps = {
            showUploadList: { showRemoveIcon: false },
            beforeUpload: file => {
                this.setState(state => ({
                    fileList: [file],
                }));
                return false;
            },
            onChange: info => {
                const imageFile = info.file;
                var reader = new FileReader();
                reader.onload = () => {
                    this.setState({ originalImage: reader.result })
                }
                reader.readAsDataURL(imageFile);

                this.setState({ mutateImage: '' })
                axios.post('/api/test_system/mutate_method/verify', {
                    mutate_method: this.props.detail
                }).then(
                    response => {
                        const data = response.data.data
                        if (data.state != true) {
                            this.setState({ mutateImage: 'error' })
                            message.error(data.error)
                            return false
                        }
                        axios.post('/api/test_system/mutate_method/image_base64_mutate', {
                            data: this.state.originalImage,
                            url: detail.url
                        }).then(
                            response => this.setState({ mutateImage: response.data.data }),
                            error => {
                                this.setState({ mutateImage: 'error' })
                                message.error(error.response.status + ":" + error.response.statusText)
                            }
                        )

                    },
                    error => {
                        this.setState({ mutateImage: 'error' })
                        message.error(error.response.status + ":" + error.response.statusText)
                    }
                )

            },
            accept: '.png,.jpeg,.jpg',
            fileList,
        };

        return (
            <div className='mutate-method-item-detail'>
                <table className="detail-table">
                    <colgroup>
                        <col width="8%" />
                        <col width="92%" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th>方法名称</th>
                            <td>{detail.name}</td>
                        </tr>
                        <tr>
                            <th>接口URL</th>
                            <td>{detail.url}<Button type='link' size="small" onClick={this.onVerifyMutateMethod}>校验该接口</Button></td>
                        </tr>
                    </tbody>
                </table>

                <Tabs defaultActiveKey="1" type="card" onChange={this.callback} style={{ marginTop: 20 }}>
                    <TabPane tab="图片数据" key="1">
                        <Upload  {...uploadProps}>
                            <Button icon={<UploadOutlined />}>选择图片</Button>
                        </Upload>
                        <table className="image-table">
                            <colgroup>
                                <col width="50%" />
                                <col width="50%" />
                            </colgroup>
                            <tbody>
                                <tr>
                                    <td style={{ display: this.state.originalImage == '' ? 'none' : 'table-cell' }}>
                                        <Image className="mutate-method-image" src={this.state.originalImage} />
                                    </td>
                                    <td style={{
                                        display: this.state.originalImage == '' ? 'none' : 'table-cell',
                                        border: this.state.mutateImage == '' ? '1px solid #f0f0f0' : 'none'
                                    }}>
                                        {
                                            this.state.mutateImage == '' ?
                                                <Spin className="mutate-method-image" /> :
                                                <Image
                                                    className="mutate-method-image"
                                                    src={this.state.mutateImage}
                                                    fallback="data:image/png;base64,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"
                                                />
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td><div className='image-description' style={{ display: this.state.originalImage == '' ? 'none' : 'block' }}> 变异前</div></td>
                                    <td><div className='image-description' style={{ display: this.state.originalImage == '' ? 'none' : 'block' }}>变异后</div></td>
                                </tr>
                            </tbody>
                        </table>
                    </TabPane>
                    <TabPane tab="自定义数据" key="2">
                        <table className="custom-data-table">
                            <tbody>
                                <tr>
                                    <td>
                                        请输入原数据：<TextArea ref={e => this.originalDataRef = e} rows={8} allowClear />
                                    </td>
                                    <td width="50px"><Button type="primary" onClick={this.onCustomDataMutate}>变异 <ArrowRightOutlined /></Button></td>
                                    <td>
                                        变异后的数据：<TextArea rows={8} value={this.state.mutateCustomData} readOnly="readonly" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </TabPane>
                </Tabs>
            </div >
        )
    }
}
