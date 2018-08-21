import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import uuid from 'uuid';
import MarketplaceTableItem from '../marketplace/marketplace-table-item';
import SiteHeader from  '../../components/site-header'
import { getAccountLedgerAction, getLedgerEntryAction } from "../../../actions/ledger";
import { setModalCallback, setBodyModalParamsAction } from "../../../modules/modals";

import {getDGSGoodsAction} from "../../../actions/marketplace";

import curve25519 from "../../../helpers/crypto/curve25519";
import converters from "../../../helpers/converters";
import crypto from "../../../helpers/crypto/crypto";

class MyProductsForSale extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            page: 1,
            firstIndex: 0,
            lastIndex: 14,
            getDGSGoods: []
        };
    }

    componentDidMount() {
        this.getDGSGoods({
            seller: this.props.account,
            requestType: 'getDGSPendingPurchases',
            firstIndex: this.state.firstIndex,
            lastIndex: this.state.lastIndex
        });
    }

    componentWillReceiveProps(newState) {
        this.setState({
            ...newState
        }, () => {
            this.getDGSGoods({
                requestType: 'getDGSPendingPurchases',
                seller: this.props.account,
                firstIndex: this.state.firstIndex,
                lastIndex: this.state.lastIndex,
                completed: true
            });
        });
    }

    onPaginate (page) {
        let reqParams = {
            page: page,
            account: this.props.account,
            requestType: 'getDGSPendingPurchases',
            completed: true,
            firstIndex: page * 15 - 15,
            lastIndex:  page * 15 - 1
        };

        this.setState(reqParams, () => {
            this.getDGSGoods(reqParams)
        });
    }

    getDGSGoods = async (reqParams) => {
        const getDGSGoods = await this.props.getDGSGoodsAction(reqParams);

        if (getDGSGoods) {
            this.setState({
                ...this.state,
                getDGSGoods: getDGSGoods.purchases
            })
        }
    };

    render () {
        return (
            <div className="page-content">
                <SiteHeader
                    pageTitle={'My Completed Orders'}
                />
                <div className="page-body container-fluid">
                    <div className="account-ledger">
                        <div className="transaction-table">
                            <div className="transaction-table-body">
                                <table>
                                    <thead>
                                    <tr>
                                        <td>Name</td>
                                        <td className="align-right">Quantity</td>
                                        <td className="align-right">Price</td>
                                        <td className="align-right">Actions</td>
                                    </tr>
                                    </thead>
                                    <tbody key={uuid()}>
                                    {
                                        this.state.getDGSGoods.map((el, index) => {
                                            return (
                                                <MarketplaceTableItem
                                                    {...el}
                                                />
                                            );
                                        })
                                    }
                                    </tbody>
                                </table>
                                <div className="btn-box">
                                    <a
                                        className={classNames({
                                            'btn' : true,
                                            'btn-left' : true,
                                            'disabled' : this.state.page <= 1
                                        })}
                                        onClick={this.onPaginate.bind(this, this.state.page - 1)}
                                    > Previous</a>
                                    <div className='pagination-nav'>
                                        <span>{this.state.firstIndex + 1}</span>
                                        <span>&hellip;</span>
                                        <span>{this.state.lastIndex + 1}</span>
                                    </div>
                                    <a
                                        onClick={this.onPaginate.bind(this, this.state.page + 1)}
                                        className={classNames({
                                            'btn' : true,
                                            'btn-right' : true,
                                            'disabled' : this.state.getDGSGoods.length < 15
                                        })}
                                    >Next</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    account: state.account.account,

    // modals
    modalData: state.modals.modalData
});

const initMapDispatchToProps = dispatch => ({
    getDGSGoodsAction: (reqParams) => dispatch(getDGSGoodsAction(reqParams)),
    setBodyModalParamsAction: (type, data) => dispatch(setBodyModalParamsAction(type, data))
});

export default connect(
    mapStateToProps,
    initMapDispatchToProps
)(MyProductsForSale);
