import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Input } from 'antd'
import { setModelSummary } from 'redux/actions/corpusSet'

const { TextArea } = Input


class Model extends Component {
    render() {
        return (
            <TextArea
                value={this.props.summary}
                rows={24}
                readOnly="readonly"
                style={{ fontFamily: "Consolas", fontSize: '14px' }}
            />
        )
    }
}

export default connect(
    state => ({ summary: state.CorpusSet.model.summary }),
    {
        setModelSummary
    }
)(Model)
