import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import PubSub from 'pubsub-js'
import { Select, Row, Col, Image, Divider, Affix, Button, Modal } from 'antd';
import Dataset from './Dataset'
import Model from './Model'
import {
    setModel,
    setDataset,
    setDatas,
    setPagination,
    setSelectedData,
    setSelectedImageBase64
} from 'redux/actions/corpusSet'
import './index.css'

const { Option } = Select

// const models_name = ["AlexNet", "LeNet5", "ResNet50", "MobileNetV1", "InceptionV3", "DenseNet121", "VGG16", "VGG19", "Xception"]
// const datasets_names = {
//     "AlexNet": ["CIFAR-10"],
//     "LeNet5": ["Fashion-MNIST", "MNIST"],
//     "ResNet50": ["ImageNet"],
//     "MobileNetV1": ["ImageNet"],
//     "InceptionV3": ["ImageNet"],
//     "DenseNet121": ["ImageNet"],
//     "VGG16": ["ImageNet"],
//     "VGG19": ["ImageNet"],
//     "Xception": ["ImageNet"],
// }

const models_name = ["AlexNet", "LeNet5"]
const datasets_names = {
    "AlexNet": ["CIFAR-10"],
    "LeNet5": ["MNIST"],
}

class Main extends Component {


    state = {
        visible: false
    }

    afterLoading = (response) => {
        PubSub.publish('Dataset.Main.state', {
            loading: false,
            status: {
                statusCode: response.status,
                statusText: response.statusText
            }
        })
    }

    getNewDatas = (datasetName) => {
        PubSub.publish('Dataset.Main.state', { loading: true })
        axios.post('/api/test_system/corpus_set/get_page', {
            dataset_name: datasetName,
            page_index: 1,
            page_size: 25
        }).then(
            response => {
                const data = response.data.data
                this.props.setDatas(data.datas)
                this.props.setPagination({
                    pageIndex: 1,
                    totalPages: data.total_pages
                })
                this.afterLoading(response)
            },
            error => {
                this.props.setDatas([])
                this.props.setPagination({
                    pageIndex: 0,
                    totalPages: 0
                })
                this.afterLoading(error.response)
            }
        )
    }

    onModelChange = (value) => {
        axios.post('/api/test_system/corpus_set/get_model', {
            model_name: value
        }).then(
            response => this.props.setModel({
                name: value,
                summary: response.data.data.summary,
                layers: response.data.data.layers
            }),
            error => this.props.setModel({
                name: value,
                summary: '',
                layers: []
            }),
        )

        this.props.setDataset(datasets_names[value][0])
        this.getNewDatas(datasets_names[value][0])
        this.props.setSelectedData({})
        this.props.setSelectedImageBase64('')
    }

    onDatasetChange = (value) => {
        this.props.setDataset(value)
        this.getNewDatas(value)
        this.props.setSelectedData({})
        this.props.setSelectedImageBase64('')
    }

    showModal = () => {
        this.setState({
            visible: true
        });
    }

    hideModal = () => {
        this.setState({
            visible: false
        });
    };

    componentDidMount() {
        const { name: modelName } = this.props.model
        axios.post('/api/test_system/corpus_set/get_model', {
            model_name: modelName
        }).then(
            response => this.props.setModel({
                name: modelName,
                summary: response.data.data.summary,
                layers: response.data.data.layers
            }),
            error => this.props.setModel({
                name: modelName,
                summary: '',
                layers: []
            }),
        )
    }

    render() {
        const { model, dataset, selectedData } = this.props
        const { name: modelName } = model
        return (
            <>
                <Row justify="space-between">
                    <Col span={24}>
                        <Divider orientation="left">????????????</Divider>
                        <div className="corpus-set-select-wrapper">
                            <div className="corpus-set-select-title">?????????</div>
                            <div className="corpus-set-select">
                                <Select placeholder="?????????????????????" defaultValue={modelName} style={{ width: "150px" }} onChange={this.onModelChange}>
                                    {models_name.map(modelName => (<Option key={modelName}>{modelName}</Option>))}
                                </Select>
                                <Button type="link" onClick={this.showModal}>??????????????????</Button>
                            </div>
                        </div>
                        <div className="corpus-set-select-wrapper">
                            <div className="corpus-set-select-title">????????????</div>
                            <div className="corpus-set-select">
                                <Select placeholder="????????????????????????" value={dataset} style={{ width: "150px" }} onChange={this.onDatasetChange}>
                                    {datasets_names[modelName].map(dataset => (<Option key={dataset}>{dataset}</Option>))}
                                </Select>
                            </div>
                        </div>
                    </Col>
                    <Modal
                        title="????????????"
                        width={'73%'}
                        visible={this.state.visible}
                        onCancel={this.hideModal}
                        footer={null}
                    >
                        <Model />
                    </Modal>
                    {/* <Col className="corpus-set-image-wrapper" span={11}>
                        <Divider orientation="left">????????????</Divider>
                        
                    </Col> */}
                </Row>


                <Row justify="space-between">
                    <Col span={12}>
                        <Divider orientation="left">?????????</Divider>
                        <Dataset name={dataset} />
                    </Col>
                    <Col className="corpus-set-image-wrapper" span={11}>
                        <Affix offsetTop={10}>
                            <div>
                                <Divider orientation="left">?????????</Divider>
                                <Image width="50%" style={{ marginTop: '50px' }} src={this.props.selectedImageBase64} />
                                <div className="corpus-set-image-description">
                                    <strong>
                                        {this.props.selectedData.filename}
                                    -{this.props.selectedData.label_description}
                                    </strong>
                                </div>
                            </div>
                        </Affix>
                    </Col>
                </Row>

            </>
        )
    }
}

export default connect(
    state => ({
        model: state.CorpusSet.model,
        dataset: state.CorpusSet.dataset,
        selectedData: state.CorpusSet.selectedData,
        selectedImageBase64: state.CorpusSet.selectedImageBase64,
    }),
    {
        setModel,
        setDataset,
        setDatas,
        setPagination,
        setSelectedData,
        setSelectedImageBase64
    }
)(Main)