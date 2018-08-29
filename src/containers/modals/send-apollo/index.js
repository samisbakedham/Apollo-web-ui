import React from 'react';
import {connect} from 'react-redux';
import {setModalData, setBodyModalParamsAction, setAlert} from '../../../modules/modals';
import {sendTransactionAction} from '../../../actions/transactions';
import {calculateFeeAction} from "../../../actions/forms";
import AdvancedSettings from '../../components/advanced-transaction-settings';
import classNames from 'classnames';
import crypto from  '../../../helpers/crypto/crypto';
import InputMask from 'react-input-mask';

import {Form, Text, TextArea, Checkbox} from 'react-form';
import InfoBox from '../../components/info-box';
import {NotificationManager} from "react-notifications";
import submitForm from "../../../helpers/forms/forms";

class SendApollo extends React.Component {
    constructor(props) {
        super(props);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        this.state = {
            activeTab: 0,
            advancedState: false,

            // submitting
            passphraseStatus: false,
            recipientStatus: false,
            amountStatus: false,
            feeStatus: false
        }

        this.handleAdvancedState = this.handleAdvancedState.bind(this);
    }

    async handleFormSubmit(values) {
        const isPassphrase = await this.props.validatePassphrase(values.secretPhrase);

        this.props.submitForm(null, null, values, 'sendMoney')
            .done((res) => {
                console.log('---------------');
                console.log(res);

                if (res.errorCode) {
                    NotificationManager.error(res.errorDescription, 'Error', 5000)
                } else {
                    this.props.setBodyModalParamsAction(null, {});

                    NotificationManager.success('Transaction has been submitted!', null, 5000);
                }
            });
    }

    handleAdvancedState() {
        if (this.state.advancedState) {
            this.setState({
                ...this.props,
                advancedState: false
            })
        } else {
            this.setState({
                ...this.props,
                advancedState: true
            })
        }
    }

    handleChange = (event) => {
        if (event.target) {
            var value = event.target.value;
            var newState = {
                mask: 'APL-****-****-****-*****',
                value: value.toUpperCase()
            };

            if (/^APL-[A-Z0-9_]{4}-[A-Z0-9_]{4}-[A-Z0-9_]{4}-[A-Z0-9_]{5}/.test(value)) {
                newState.value = 'APL-****-****-****-*****';
            }
            this.setState(newState);
        }
    };

    calculateFee = () => {

        this.setState({
            ...this.state,
            feeATM: 1
        })
    };

    render() {
        return (
            <div className="modal-box">
                <Form
                    onSubmit={(values) => this.handleFormSubmit(values)}
                    render={({
                         submitForm, values, addValue, removeValue, setValue, getFormState
                    }) => (
                        <form className="modal-form" onSubmit={submitForm}>
                            <div className="form-group">
                                <div className="form-title">
                                    <p>Send Apollo</p>
                                </div>
                                <div className="input-group offset-top display-block inline user">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label>Recipient</label>
                                        </div>
                                        <div className="col-md-9">
                                            <div className="iconned-input-field">
                                                <InputMask mask='APL-****-****-****-*****' value={this.state.value}  onChange={(e) => {if (e.target) setValue('recipient', e.target.value)}}>
                                                    {(inputProps) => {
                                                        return (
                                                            <Text  {...inputProps} field="recipient" placeholder="Recipient" />
                                                        );
                                                    }}
                                                </InputMask>

                                                <div className="input-icon"><i className="zmdi zmdi-account" /></div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="input-group offset-top display-block inline">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label>Amount</label>
                                        </div>
                                        <div className="col-md-9">
                                            <div className="input-wrapper">
                                                <Text field="amountATM" placeholder="Amount" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group offset-top display-block inline">
                                    <div className="row">
                                        <div className="col-md-3">
                                        </div>
                                        <div className="col-md-9">
                                            <div className="input-wrapper">
                                                <div className="form-sub-actions">
                                                    <div
                                                        className="input-group align-middle display-block offset-bottom"
                                                    >
                                                        <div className="input-group align-middle display-block offset-bottom">
                                                            <Checkbox style={{display: 'inline-block'}} type="checkbox" field="isMessage"/>
                                                            <label>Add note to self?</label>
                                                        </div>
                                                        <a
                                                            onClick={() => this.props.setBodyModalParamsAction('SEND_APOLLO_PRIVATE')}
                                                            className="no-margin btn static blue"
                                                        >
                                                            Private transaction?
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    getFormState().values.isMessage &&
                                    <div className="input-group offset-top display-block inline">
                                        <div className="row">
                                            <div className="col-md-3">
                                            </div>
                                            <div className="col-md-9">
                                                <div className="input-wrapper">
                                                    <TextArea placeholder="Message" field="message" cols="30" rows="10" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <div className="input-group offset-top display-block inline">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label style={{paddingRight: 7}}>Fee</label>
                                            <span
                                                onClick={async () => {
                                                        const formState = getFormState();
                                                        const fee = await this.props.calculateFeeAction({
                                                            recipient: formState.values.recipient,
                                                            amountATM: formState.values.amountATM,
                                                            publicKey: this.props.publicKey,
                                                            feeATM: 0
                                                        });

                                                        if (fee) {
                                                            setValue("feeATM", fee.transactionJSON.feeATM / 100000000);
                                                        }
                                                    }
                                                }
                                                style={{paddingRight: 0}}
                                                className="calculate-fee"
                                            >
                                                Calculate</span>
                                        </div>
                                        <div className="col-md-9">
                                            <Text field="feeATM" value={this.state.feeATM} placeholder="Amount" />
                                        </div>
                                    </div>
                                </div>
                                <div className="input-group offset-top display-block inline">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <label>Passphrase</label>
                                        </div>
                                        <div className="col-md-9">
                                            <Text field="secretPhrase" placeholder="secretPhrase" />
                                        </div>
                                    </div>
                                </div>
                                {
                                    this.state.passphraseStatus &&
                                    <InfoBox danger mt>
                                        Incorrect passphrase.
                                    </InfoBox>
                                }
                                {
                                    this.state.recipientStatus &&
                                    <InfoBox danger mt>
                                        Incorrect recipient.
                                    </InfoBox>
                                }
                                {
                                    this.state.amountStatus &&
                                    <InfoBox danger mt>
                                        Missing amount.
                                    </InfoBox>
                                }
                                {
                                    this.state.feeStatus &&
                                    <InfoBox danger mt>
                                        Missing fee.
                                    </InfoBox>
                                }

                                <AdvancedSettings advancedState={this.state.advancedState}/>

                                <div className="btn-box align-buttons-inside absolute right-conner align-right">
                                    <button
                                        className="btn round round-top-left"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        name={'closeModal'}
                                        className="btn btn-right blue round round-bottom-right"
                                    >
                                        Send
                                    </button>

                                </div>
                                <div className="btn-box align-buttons-inside absolute left-conner">
                                    <a
                                        onClick={this.handleAdvancedState}
                                        className="btn btn-right round round-bottom-left round-top-right absolute"
                                        style={{left : 0, right: 'auto'}}
                                    >
                                        Advanced
                                    </a>
                                </div>
                            </div>
                        </form>
                    )}
                >

                </Form>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    modalData: state.modals.modalData,
    account: state.account.account,
    publicKey: state.account.publicKey
});

const mapDispatchToProps = dispatch => ({
    setAlert: (status, message) => dispatch(setAlert(status, message)),
    submitForm: (modal, btn, data, requestType) => dispatch(submitForm.submitForm(modal, btn, data, requestType)),
    setModalData: (data) => dispatch(setModalData(data)),
    setBodyModalParamsAction: (type, data) => dispatch(setBodyModalParamsAction(type, data)),
    sendTransaction: (requestParams) => dispatch(sendTransactionAction(requestParams)),
    validatePassphrase: (passphrase) => dispatch(crypto.validatePassphrase(passphrase)),
    calculateFeeAction: (requestParams) => dispatch(calculateFeeAction(requestParams))
});

export default connect(mapStateToProps, mapDispatchToProps)(SendApollo);
