import React, { Component } from 'react'
import axios from 'axios'
import fileDownload from "js-file-download";
import { Spin, Image, Button, Result } from 'antd'
import './index.css'


export default class TestRecordDetail extends Component {

    state = {
        loading: true,
        status: {
            statusCode: 200,
            statusText: 'OK'
        },
        datas: [],
        weights_size: '0Byte',
    }

    download = () => {
        const { tid, iterate_time } = this.props.detail
        axios.post('/api/test_system/diff_test/get_test_record_weights',
            { tid, iterate_time },
            { responseType: 'blob' }
        ).then(
            response => {
                console.log(response.data);
                fileDownload(response.data, tid + '-' + iterate_time + '.json')
            },
            error => {
                console.log(error);
            }
        )
    }

    loadData = () => {
        this.setState({ loading: true })
        const { tid, iterate_time } = this.props.detail
        axios.post('/api/test_system/diff_test/get_test_record', { tid, iterate_time }).then(
            response => {
                const data = response.data.data
                var datas = new Array()
                for (var i = 0; i < data.images.length; i++) {
                    datas.push({
                        image: data.images[i],
                        label: data.labels[i]
                    })
                }
                this.setState({
                    datas,
                    weights_size: data.weights_size,
                    loading: false,
                    status: {
                        statusCode: response.status,
                        statusText: response.statusText
                    }
                })
            },
            error => {
                this.setState({
                    loading: false,
                    status: {
                        statusCode: error.response.status,
                        statusText: error.response.statusText
                    }
                })
            }
        )
    }

    componentDidMount() {
        this.loadData()
    }

    render() {
        const { detail } = this.props
        if (this.state.loading == true)
            return (<Spin />)
        if (this.state.status.statusCode != 200)
            return (
                <Result
                    status="error"
                    title={this.state.status.statusCode + ''}
                    subTitle={this.state.status.statusText}
                    extra={<Button type="primary" type="link" onClick={this.loadData}>重新加载</Button>}
                />
            )
        return (
            this.state.loading == true ?
                <Spin /> :
                < table className="test-record-detail" >
                    <colgroup className="my-group">
                        <col width="8%" />
                        <col width="92%" />
                    </colgroup>
                    <tbody>
                        <tr>
                            <th colSpan="1" >参数</th>
                            <td colSpan="1">
                                <Button type="link" onClick={this.download}>下载</Button>
                                大小:{this.state.weights_size}
                            </td>
                        </tr>
                        <tr>
                            <th colSpan="1">输入</th>
                            <td colSpan="1" >{
                                this.state.datas.map((data, index) => {
                                    return (
                                        <div key={index} style={{ display: "inline-block" }}>
                                            <div style={{}}><Image width={100} src={data.image} /></div>
                                            <div style={{ margin: "0 auto", width: "fit-content" }}>{data.label}</div>
                                        </div>

                                    )
                                })
                            }</td>
                        </tr>
                    </tbody>
                </table >

        )
    }

}
