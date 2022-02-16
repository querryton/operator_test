import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Card, Row, Col } from 'antd'
import { setSelectedData, setSelectedImageBase64 } from 'redux/actions/corpusSet'

class DataItem extends Component {

    handleSelect = () => {
        this.props.setSelectedData(this.props.item)
        axios.post('/api/test_system/corpus_set/data_to_base64', {
            id: this.props.item.id
        }).then(
            response => this.props.setSelectedImageBase64(response.data.data),
            error => this.props.setSelectedImageBase64('')
        )
    }

    render() {
        const { item } = this.props
        return (
            <div>
                <Card style={{ width: "100%" }} hoverable="true" size="small" onClick={this.handleSelect}>
                    <Row>
                        <Col span={18}>
                            <div className="item-description-line">{item.filename}</div>
                        </Col>
                        <Col span={6}>
                            <div className="item-description-line">{item.label_description}</div>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }
}

export default connect(
    state => ({}),
    {
        setSelectedData,
        setSelectedImageBase64,
    }
)(DataItem)
