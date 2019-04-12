import React from 'react';
import {connect} from "react-redux";
import {Form} from "react-form";
import {NotificationManager} from "react-notifications";
import InputForm from '../../../components/input-form';
import {currencyTypes, formatCrypto} from "../../../../helpers/format";
import {createOffer} from "../../../../actions/wallet";
import {setBodyModalParamsAction} from "../../../../modules/modals";

class ExchangeSell extends React.Component {
    state = {
        form: null,
    };

    handleFormSubmit = (values) => {
        if (this.props.wallet) {
            if (values.offerAmount > 0 && values.pairRate > 0) {
                const params = {
                    offerType: 1, // SELL

                    pairCurrency: currencyTypes['apl'],
                    pairRate: values.pairRate * 100000000,

                    offerAmount: values.offerAmount * 100000000,
                    offerCurrency: currencyTypes[this.props.currentCurrency.currency],

                    sender: this.props.account,
                    secretPhrase: this.props.passPhrase,
                };
                if (this.props.passPhrase) {
                    this.props.createOffer(params);
                    if (this.state.form) this.state.form.resetAll();
                } else {
                    this.props.setBodyModalParamsAction('CONFIRM_CREATE_OFFER', {
                        params,
                        resetForm: this.state.form.resetAll
                    });
                }
            } else {
                NotificationManager.error('Price and amount are required fields', 'Error', 5000);
            }
        } else {
            this.props.handleLoginModal();
        }
    };

    getFormApi = (form) => {
        this.setState({form})
    };

    render() {
        const {currentCurrency: {currency}, wallet} = this.props;
        const balanceFormat = wallet && wallet.wallets && formatCrypto(wallet.wallets[0].balance);
        const currencyName = currency.toUpperCase();
        return (
            <div className={'card-block green card card-medium pt-0 h-400'}>
                <Form
                    onSubmit={values => this.handleFormSubmit(values)}
                    getApi={this.getFormApi}
                    render={({
                                 submitForm, setValue, values
                             }) => (
                        <form className="modal-form modal-send-apollo modal-form" onSubmit={submitForm}>
                            <div className="form-title">
                                <p>Sell {currencyName}</p>
                            </div>
                            <div className="form-group row form-group-white mb-15">
                                <label>
                                    Price for 1 {currencyName}
                                </label>
                                <div className="input-group input-group-text-transparent">
                                    <InputForm
                                        field="pairRate"
                                        type={"float"}
                                        onChange={(price) => setValue("total", values.offerAmount * price)}
                                        setValue={setValue}/>
                                    <div className="input-group-append">
                                        <span className="input-group-text">APL</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row form-group-white mb-15">
                                <label>
                                    I want to Sell
                                </label>
                                <div
                                    className="input-group input-group-text-transparent">
                                    <InputForm
                                        field="offerAmount"
                                        type={"float"}
                                        onChange={(amount) => setValue("total", amount * values.pairRate)}
                                        setValue={setValue}/>
                                    <div className="input-group-append">
                                        <span className="input-group-text">{currencyName}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group row form-group-white mb-15">
                                <label>
                                    I will receive
                                </label>
                                <div
                                    className="input-group input-group-text-transparent">
                                    <InputForm
                                        field="total"
                                        type={"float"}
                                        setValue={setValue}
                                        disabled/>
                                    <div className="input-group-append">
                                        <span className="input-group-text">APL</span>
                                    </div>
                                </div>
                            </div>
                            {wallet && wallet.wallets && (
                                <div className={'form-group-text d-flex justify-content-between'}>
                                    of Total Balance: <span><i
                                    className="zmdi zmdi-balance-wallet"/> {balanceFormat} {currencyName}</span>
                                </div>
                            )}
                            <div className="btn-box align-buttons-inside align-center form-footer">
                                <button
                                    type="submit"
                                    name={'closeModal'}
                                    className={'btn btn-lg btn-green submit-button'}
                                >
                                    <span className={'button-text'}>Sell {currencyName}</span>
                                </button>
                            </div>
                        </form>
                    )}/>
            </div>
        )
    }
}

const mapStateToProps = ({account}) => ({
    account: account.account,
    passPhrase: account.passPhrase,
});

const mapDispatchToProps = dispatch => ({
    createOffer: (params) => dispatch(createOffer(params)),
    setBodyModalParamsAction: (type, value) => dispatch(setBodyModalParamsAction(type, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeSell);