import React, { Component } from "react"
import ReactMarkdown from 'react-markdown'
import { Tag } from 'antd';
import "./index.css"
export default class Detail extends Component {
    render() {
        const { detail } = this.props
        return (
            <table className="bug-detail">
                <colgroup className="my-group">
                    <col width="8%" />
                    <col span="3" width="14%" />
                    <col width="8%" />
                    <col width="17%" />
                    <col width="8%" />
                    <col width="17%" />
                </colgroup>
                <tbody>
                    <tr>
                        <th colSpan="1" >标题</th>
                        <td colSpan="7">{detail.title}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">作者</th>
                        <td colSpan="3">{detail.author}</td>
                        <th colSpan="1">创建时间</th>
                        <td colSpan="1" >{detail.created_at}</td>
                        <th colSpan="1" >更新时间</th>
                        <td colSpan="1" >{detail.updated_at}</td>
                    </tr>
                    <tr>
                        <th colSpan="1">问题状态</th>
                        <td colSpan="3">{detail.state}</td>
                        <th colSpan="1">标签</th>
                        <td colSpan="3" >{
                            detail.labels.map((label, index) => {
                                return (<Tag color={'#' + label.color + 'C0'} key={index}>{label.name} </Tag>)
                            })
                        }</td>
                    </tr>
                    <tr>
                        <th colSpan="1">回复状态</th>
                        <td colSpan="3">{detail.answered ? "Yes" : "No"}</td>
                        <th colSpan="1">回复数目</th>
                        <td colSpan="3" >
                            {detail.comment_number}&nbsp;&nbsp;&nbsp;&nbsp;
                                <a href={detail.link} target={"_blank"}>查看详情</a>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="1">Bug描述</th>
                        <td colSpan="7">
                            <ReactMarkdown source={detail.bug_description} />
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}