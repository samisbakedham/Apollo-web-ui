import React from 'react';
import {connect} from 'react-redux';
import {setModalData} from '../../../modules/modals';
import {getLedgerEntryAction} from '../../../actions/ledger/';
import classNames from 'classnames';

class InfoTransactions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 0
        };

        this.handleTab = this.handleTab.bind(this);
    }

    handleTab(e, index) {
        e.preventDefault();

        this.setState({
            ...this.props,
            activeTab: index
        })
    }

    componentDidMount = () => {
        this.getAccountLedgerEntry();
    };

    getAccountLedgerEntry = async () => {
        const entry = await this.props.getLedgerEntryAction({ledgerId: this.props.modalData});

        if (entry) {
            this.setState({
                entry
            })
        }
    };

    // TODO: migrate timesamp, migrate account to RS

    render() {
        return (
            <div className="modal-box wide">
                {
                    this.props.modalData &&
                    <form className="modal-form">
                        <div className="form-group-app">
                            <a onClick={() => this.props.closeModal()} className="exit"><i className="zmdi zmdi-close" /></a>

                            <div className="form-title">
                                <p>Ledger <strong>{this.props.modalData.ledgerId}</strong> info</p>
                            </div>

                            <div className="transaction-table no-min-height">
                                <div className="transaction-table-body transparent">
                                    <table>
                                        {
                                            this.state.entry &&
                                            <tbody>
                                                <tr>
                                                    <td>Event Type:	</td>
                                                    <td>{this.state.entry.eventType}</td>
                                                </tr>
                                                <tr>
                                                    <td>Ledger Id:</td>
                                                    <td>{this.state.entry.ledgerId}</td>
                                                </tr>
                                                <tr>
                                                    <td>Holding Type:</td>
                                                    <td>{this.state.entry.holdingType}</td>
                                                </tr>
                                                <tr>
                                                    <td>Account RS:	</td>
                                                    <td>{this.state.entry.accountRS}</td>
                                                </tr>
                                                <tr>
                                                    <td>Account:</td>
                                                    <td>{this.state.entry.account}</td>
                                                </tr>
                                                <tr>
                                                    <td>Timestamp:</td>
                                                    <td>{this.state.entry.timestamp}</td>
                                                </tr>
                                                <tr>
                                                    <td>Height:</td>
                                                    <td>{this.state.entry.height}</td>
                                                </tr>
                                                <tr>
                                                    <td>Transaction:</td>
                                                    <td>{this.state.entry.event}</td>
                                                </tr>
                                                <tr>
                                                    <td>Change:</td>
                                                    <td>{this.state.entry.change / 100000000}</td>
                                                </tr>
                                                <tr>
                                                    <td>Balance:</td>
                                                    <td>{Math.round(this.state.entry.balance / 100000000)}</td>
                                                </tr>
                                            </tbody>
                                        }
                                    </table>
                                </div>
                            </div>
                            <div className="btn-box align-buttons-inside absolute right-conner">
                                <a className="btn btn-right round round-top-left round-bottom-right"
                                   onClick={() => this.props.closeModal()}
                                >
                                    Close
                                </a>
                            </div>
                        </div>
                    </form>
                }

            </div>
        );
    }
}

const mapStateToProps = state => ({
    modalData: state.modals.modalData
});

const mapDispatchToProps = dispatch => ({
    setModalData: (data) => dispatch(setModalData(data)),
    getLedgerEntryAction: (data) => dispatch(getLedgerEntryAction(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoTransactions);
