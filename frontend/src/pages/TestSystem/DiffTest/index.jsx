import React, { Component } from 'react';
import Setting from 'components/testSystem/diffTest/Setting'
import ResultsChart from 'components/testSystem/diffTest/ResultsChart'
import ResultSummary from 'components/testSystem/diffTest/ResultsSummary'

export default class DiffTest extends Component {

    render() {
        return (
            <>
                <Setting />
                <ResultsChart />
                <ResultSummary />
            </>
        )
    }
}
