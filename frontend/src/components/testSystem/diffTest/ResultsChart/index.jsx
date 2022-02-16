import React, { Component } from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { Divider, Button } from 'antd'
import ReactEcharts from 'echarts-for-react'


class ResultsChart extends Component {

    getOtion = () => {
        const { results, layers } = this.props
        if (results.length != 0) {
            var data = new Array(results[0].length)
            for (var i = 0; i < data.length; i++)
                data[i] = new Array()
            for (var i = 0; i < results.length; i++)
                for (var j = 0; j < results[i].length; j++)
                    data[j].push(results[i][j])
        }

        const option = {
            // title: {
            //     text: '差分测试进程',
            // },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: layers
            },
            toolbox: {
                show: true,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: { readOnly: false },
                    magicType: { type: ['line', 'bar'] },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                name: '测试次数',
                boundaryGap: false,
                data: results.map((item, idx) => {
                    return idx + 1
                })
            },
            yAxis: {
                type: 'value',
                name: '差异值',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            series: layers.map((item, idx) => {
                return {
                    name: item,
                    type: 'line',
                    data: data == undefined ? [] : data[idx * 2],
                    // markPoint: {
                    //     data: [
                    //         { type: 'max', name: '最大值' },
                    //         { type: 'min', name: '最小值' }
                    //     ]
                    // },
                    // markLine: {
                    //     data: [
                    //         { type: 'average', name: '平均值' }
                    //     ]
                    // }
                }
            })
            // [
            //     {
            //         ...
            //         markLine: {
            //             data: [
            //                 [{
            //                     symbol: 'none',
            //                     x: '90%',
            //                     yAxis: 'max'
            //                 }, {
            //                     symbol: 'circle',
            //                     label: {
            //                         normal: {
            //                             position: 'start',
            //                             formatter: '最大值'
            //                         }
            //                     },
            //                     type: 'max',
            //                     name: '最高点'
            //                 }]
            //             ]
            //         }
            //     }
            // ]
        };
        return option;
    }



    render() {
        return (
            <>
                <Divider orientation="left">测试结果</Divider>
                <ReactEcharts
                    option={this.getOtion()}
                    style={{ height: '350px', width: '90%' }}
                    className='react_for_echarts' />
            </>
        )
    }
}

export default connect(
    state => ({
        layers: state.CorpusSet.model.layers,
        results: state.DiffTest.results,
    }),
    {

    }
)(ResultsChart)
