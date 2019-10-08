import React from 'react';

import {Bar, defaults as chartDefaults} from 'react-chartjs-2';

import BigNumberDisplay from '../components/BigNumberDisplay.jsx';

// Ethereum Explorer home page - displays system stats

export default class Home extends React.Component {

    constructor(props) {

        super(props);
        this._link = this.props.mixClient;

        // Remove grid and labels on charts
        this.chartOptions = {
            legend: {display: false},
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    display: false,
                    gridLines: {
                        display: false
                    }
                }]
            }
        };
        this.state = {};
    }

    // Build props object for the difficulty and block time bar charts
    getChartData(systemStats) {

        let difficultyData = [];
        systemStats.latestBlocks.forEach(
            (block) => {
                difficultyData.push(block.difficulty.toString(10));
            }
        );

        let difficultyChartData = {
            labels: Array.apply(null, Array(10)).map(String.prototype.valueOf, ""),
            datasets: [
                {
                    label: 'Difficulty',
                    backgroundColor: '#557EBF',
                    borderColor: '#557EBF',
                    borderWidth: 1,
                    hoverBackgroundColor: '#9153C1',
                    hoverBorderColor: '#9153C1',
                    data: difficultyData
                }
            ]
        };

        // Just clone the chart options for now.
        let blockTimeChartData = JSON.parse(JSON.stringify(difficultyChartData));

        blockTimeChartData.datasets[0].label = 'Block time';

        // We only know the block times for the last 9 blocks, therefore there are only 9 labels.
        blockTimeChartData.labels = Array.apply(null, Array(9)).map(String.prototype.valueOf, "");
        blockTimeChartData.datasets[0].data = systemStats.blockTimes.blockTimes.filter(function(number) {
            if(number > 0) {
                return number;
            }
        });

        return {
            difficultyChart: difficultyChartData,
            blockTimeChart: blockTimeChartData
        };

    }

    getStats() {

        let systemStats = {}, charts = {};
        return new Promise(
            (resolve, reject) => {
                this._link.getSystemStats().then(
                    (stats) => {
                        systemStats = stats;
                        charts = this.getChartData(systemStats);
                        this.setState({systemStats: systemStats, charts: charts});
                        resolve();
                    },
                    (error) => {
                        reject(error);
                    }
                );

            }
        );

    }

    watchNetwork() {

        // Watch the network for new blocks. Add the new block to the list of
        // latest blocks when it's created and update the stats + UI.
        this.watchFilter = this._link.watchNetwork(
            (blockHash) => {

                this._link.getBlock(blockHash).then(
                    (newBlock) => {

                        let latestBlocks = this.state.systemStats.latestBlocks;

                        // Only allow ten blocks in the list
                        latestBlocks.shift();
                        latestBlocks.push(newBlock);

                        return latestBlocks;

                    }
                ).catch(
                    (error) => {

                        alert(error.message);

                    }
                ).then(
                    (latestBlocks) => {

                        this._link.updateBlocks(latestBlocks).then(
                            (stats) => {

                                // Update the stats
                                const charts = this.getChartData(stats);

                                // Update the UI
                                this.setState({systemStats: stats, charts: charts});

                            }
                        )

                    }
                )
            },
            (error) => {
                console.error(error.message);
            }
        );

    };

    componentDidMount() {

        const that = this;

        // Get initial ten blocks
        this.getStats().then(
            () => {
                this.watchNetwork();
            }
        )

    }

    componentWillUnmount() {

        try {

            // Stop watch when the page is changed.
            this.watchFilter.stopWatching();
        } catch (err) {

            // Metamask throwing errors for this at the moment
            console.error(err.message);
        }


    }

    render() {

        if (!this.state.systemStats) {

            return <div className="home-page content-page">
                <div className="alert alert-info">Please wait...</div>
            </div>

        }

        return (

            <div ref="homeRef" className="row home-page content-page">
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-circle-o-notch" aria-hidden="true"></i> Status</div>
                        <div className="panel-body text-center">
                            <span className="statValue">{this.state.systemStats.state}</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-wifi" aria-hidden="true"></i> Peers</div>
                        <div className="panel-body text-center">
                            <span className="statValue">{this.state.systemStats.peerCount}</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-cubes" aria-hidden="true"></i> Latest Block</div>
                        <div className="panel-body text-center">
                            <span className="statValue"><a href={`/block/${this.state.systemStats.latestBlocks[this.state.systemStats.latestBlocks.length - 1].number}`}>{this.state.systemStats.latestBlocks[this.state.systemStats.latestBlocks.length - 1].number}</a></span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-fire" aria-hidden="true"></i> Gas price</div>
                        <div className="panel-body text-center">
                            <span className="statValue">{Number(this.state.systemStats.gasPrice).toFixed(2)} Gwei</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-bolt" aria-hidden="true"></i> Ave. difficulty</div>
                        <div className="panel-body text-center">
                            <span className="statValue">
                                <BigNumberDisplay number={this.state.systemStats.difficulty} unit="H"/>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-2">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-cogs" aria-hidden="true"></i> Hashrate</div>
                        <div className="panel-body text-center">
                            <span className="statValue">
                                <BigNumberDisplay number={this.state.systemStats.hashRate} unit="H/s"/>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-cog" aria-hidden="true"></i> Difficulty</div>
                        <div className="panel-body">
                            <Bar ref="difficultyChart" options={this.chartOptions} data={this.state.charts.difficultyChart}/>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-sm-6 col-xs-12">
                    <div className="panel panel-default">
                        <div className="panel-heading"><i className="fa fa-clock-o" aria-hidden="true"></i> Block time (s)</div>
                        <div className="panel-body">
                            <Bar ref="difficultyChart" options={this.chartOptions} data={this.state.charts.blockTimeChart}/>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                </div>
                <div className="clearfix"></div>
            </div>

        )

    }

}