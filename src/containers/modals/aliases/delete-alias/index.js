/******************************************************************************
 * Copyright © 2018 Apollo Foundation                                         *
 *                                                                            *
 ******************************************************************************/


import React from 'react';
import {connect} from 'react-redux';
import {setBodyModalParamsAction, setModalData, saveSendModalState, openPrevModal} from '../../../../modules/modals';
import classNames from 'classnames';

import { Form, Text } from 'react-form';
import InputForm from '../../../components/input-form';
import {NotificationManager} from "react-notifications";
import {getAliasAction} from "../../../../actions/aliases";
import submitForm from "../../../../helpers/forms/forms";
import AdvancedSettings from '../../../components/advanced-transaction-settings'
import ModalFooter from '../../../components/modal-footer'
import FeeCalc from '../../../components/form-components/fee-calc';

import BackForm from '../../modal-form/modal-form-container';

class DeleteAlias extends React.Component {
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
        };

        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleAdvancedState = this.handleAdvancedState.bind(this);
    }

    componentDidMount = () => {
        this.getAlias();
    };

    async handleFormSubmit(values) {

        values = {
            ...values,
            priceATM: 0,
            aliasName: this.state.alias.aliasName
        };

        this.setState({
            isPending: true
        })

        const res = await this.props.submitForm( values, 'deleteAlias');
        if (res.errorCode) {
            this.setState({
                isPending: false
            })
            NotificationManager.error(res.errorDescription, 'Error', 5000)
        } else {
            this.props.setBodyModalParamsAction(null, {});
            NotificationManager.success('Product has been listed!', null, 5000);
        }

        // this.props.sendTransaction(values);
        // this.props.setBodyModalParamsAction(null, {});
        // this.props.setAlert('success', 'Transaction has been submitted!');
    }

    getAlias = async () => {
        const alias = await this.props.getAliasAction({alias: this.props.modalData});

        if (alias) {
            this.setState({
                alias
            });
        }
    };

    handleTabChange(tab) {
        this.setState({
            ...this.props,
            activeTab: tab
        })
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

    handleChange = (value) => {
        this.setState({
            inputType: value
        })
    };

    render() {
        return (
            <div className="modal-box">
                <BackForm
	                nameModal={this.props.nameModal}
                    onSubmit={(values) => this.handleFormSubmit(values)}
                    render={({
                                 submitForm, setValue, values, getFormState
                             }) => (
                        <form className="modal-form" onChange={() => this.props.saveSendModalState(values)} onSubmit={submitForm}>
                            {
                                this.state.alias &&
                                <div className="form-group-app">
                                    <a onClick={() => this.props.closeModal()} className="exit"><i className="zmdi zmdi-close" /></a>

                                    <div className="form-title">
                                        {this.props.modalsHistory.length > 1 &&
                                        <div className={"backMy"} onClick={() => {this.props.openPrevModal()}}></div>
                                        }
                                        <p>Delete Alias</p>
                                    </div>
                                    <div className="form-group row form-group-white mb-15">
                                        <label className="col-sm-3 col-form-label">
                                            Alias
                                        </label>
                                        <div className="col-sm-9">
                                            <span>{this.state.alias.aliasName}</span>
                                        </div>
                                    </div>
                                    <FeeCalc
                                        values={getFormState().values}
                                        setValue={setValue}
                                        requestType={'deleteAlias'}
                                    />
                                    <ModalFooter
                                        setValue={setValue}
                                        getFormState={getFormState}
                                        values={values}
                                    />


                                    <div className="btn-box align-buttons-inside absolute right-conner align-right">
                                        <a
                                            onClick={() => this.props.closeModal()}
                                            className="btn round round-top-left"
                                        >
                                            Cancel
                                        </a>

                                        {
                                            !!this.state.isPending ?
                                                <div
                                                    style={{
                                                        width: 100
                                                    }}
                                                    className="btn btn-right blue round round-bottom-right"
                                                >
                                                    <div className="ball-pulse">
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                    </div>
                                                </div> :
                                                <button
                                                    style={{
                                                        width: 100
                                                    }}
                                                    type="submit"
                                                    name={'closeModal'}
                                                    className="btn btn-right blue round round-bottom-right"
                                                >
                                                    Delete alias
                                                </button>
                                        }
                                    </div>
                                    {/*<div className="btn-box align-buttons-inside absolute left-conner">*/}
                                        {/*<a*/}
                                            {/*onClick={this.handleAdvancedState}*/}
                                            {/*className="btn btn-right round round-bottom-left round-top-right absolute"*/}
                                            {/*style={{left : 0, right: 'auto'}}*/}
                                        {/*>*/}
                                            {/*{this.state.advancedState ? "Basic" : "Advanced"}*/}
                                        {/*</a>*/}
                                    {/*</div>*/}
                                    <AdvancedSettings
                                        setValue={setValue}
                                        getFormState={getFormState}
                                        values={values}
                                        advancedState={this.state.advancedState}
                                    />
                                </div>
                            }
                        </form>
                    )}
                >

                </BackForm>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    modalData: state.modals.modalData,
    modalsHistory: state.modals.modalsHistory,
});

const mapDispatchToProps = dispatch => ({
    setModalData: (data) => dispatch(setModalData(data)),
    submitForm: (data, requestType) => dispatch(submitForm.submitForm(data, requestType)),
    getAliasAction: (requestParams) => dispatch(getAliasAction(requestParams)),
    setBodyModalParamsAction: (type, data, valueForModal) => dispatch(setBodyModalParamsAction(type, data, valueForModal)),
    saveSendModalState: (Params) => dispatch(saveSendModalState(Params)),
	openPrevModal: () => dispatch(openPrevModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeleteAlias);
