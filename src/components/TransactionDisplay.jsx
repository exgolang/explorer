
import React from 'react';
import {Link} from 'react-router-dom';

const mixApi = require('mix-api'),
    MixClient = mixApi.MixClient;

export default class TransactionDisplay extends React.Component {

    constructor(props) {
        super(props);

        this.mixClient = null;
        try{
            // The LinkClient will try various methods of connecting to a blockchain network
            this.mixClient = new MixClient();
        }catch(err){

            console.error(err.message);

        }

    }

    render() {

        return (
            <div className="transaction-display">
                <div className="col-md-6 col-md-offset-3">
                    <div className="panel panel-default">
                        <div className="panel-heading">Transaction Information</div>
                        <div className="panel-body">
                            <table className="table">
                                <tbody>
                                <tr>
                                    <td colSpan="2">
                                        <label className="transaction-from-to-label">From</label>
                                        <Link to={'/account/' + this.props.transaction.from}>
                                            <span className="font-monospace">{this.props.transaction.from}</span>
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <label className="transaction-from-to-label">To</label>
                                        <Link to={'/account/' + this.props.transaction.to}>
                                            <span className="font-monospace">{this.props.transaction.to}</span>
                                        </Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>Block number</label></td>
                                    <td>
                                        <Link to={'/block/' + this.props.transaction.blockNumber}>{this.props.transaction.blockNumber}</Link>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>Value</label></td>
                                    <td>{this.mixClient.web3.fromWei(this.props.transaction.value.toString(10))} AGR</td>
                                </tr>
                                <tr>
                                    <td><label>Gas price</label></td>
                                    <td>{this.mixClient.web3.fromWei(this.props.transaction.gasPrice.toString(10))} AGR</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )

    }

}