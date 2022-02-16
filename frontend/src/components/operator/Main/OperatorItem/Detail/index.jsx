import React, { Component } from 'react'
import './index.css'

export default class index extends Component {
    render() {
        const { detail } = this.props
        // console.log(detail);
        return (
            <table className="operator-detail">
                <colgroup className="my-group">
                    <col width="8%" />
                    <col width="42%" />
                    <col width="8%" />
                    <col width="42%" />
                </colgroup>
                <tbody>
                    <tr>
                        <th colSpan="1" >算子</th>
                        <td colSpan="3">{detail.name}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">库</th>
                        <td colSpan="1">{detail.library}</td>
                        <th colSpan="1">版本</th>
                        <td colSpan="1" >{detail.version}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">输入</th>
                        <td colSpan="3">{detail.input}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">输出</th>
                        <td colSpan="3">{detail.output}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">参数</th>
                        <td colSpan="3">
                            <ul  className="parameters">
                                {detail.parameters.map((parameter) => {
                                    return(<li key={parameter.id}>
                                        <strong>{parameter.name}</strong>&nbsp;&nbsp;
                                        {parameter.description}
                                    </li>)
                                })}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}
