import React from 'react';
import { Form, Text, Radio, RadioGroup, TextArea, Checkbox } from "react-form";
import converters from '../../../helpers/converters';
import {connect} from 'react-redux';
import {setModalData} from '../../../modules/modals';

import curve25519 from '../../../helpers/crypto/curve25519'
import crypto from  '../../../helpers/crypto/crypto';

import InfoBox from '../../components/info-box';


class PrivateTransactions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            passphraseStatus: false
        }

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    componentDidMount() {
        console.log(curve25519);
    }

    async validatePassphrase(passphrase) {
        return await this.props.validatePassphrase(passphrase);
    }

    async handleFormSubmit(params) {
        let passphrase = params.passphrase;

        const isPassed = await this.validatePassphrase(passphrase);
        if (!isPassed) {
            this.setState({
                ...this.props,
                passphraseStatus: true
            })
            return;
        } else {
            this.setState({
                ...this.props,
                passphraseStatus: false
            }, () => {

            })
        }

        const privateKey = crypto.getPrivateKey(passphrase);
        const publicKey  = this.props.publicKey;

        var sharedKey;

        sharedKey = crypto.getSharedSecretJava(
            converters.hexStringToByteArray(crypto.getPrivateKey(passphrase)),
            converters.hexStringToByteArray(this.props.publicKey)
        );

        sharedKey = new Uint8Array(sharedKey);

        const data = {
            publicKey: publicKey,
            privateKey: privateKey
        };

        this.props.setModalData(data);
    }

    render() {
        return (
            <div className="modal-box">
                <Form
                    onSubmit={values => this.handleFormSubmit(values)}
                    render={({
                                   submitForm
                               }) => (
                    <form className="modal-form"  onSubmit={submitForm}>
                        <div className="form-group">
                            <div className="form-title">
                                <p>Show private transactions</p>
                            </div>
                            <div className="input-group">
                                <div className="row">
                                    <div className="col-md-3">
                                        <label>Passphrase</label>
                                    </div>
                                    <div className="col-md-9">
                                        <Text field="passphrase" placeholder='Secret phrase' />
                                    </div>
                                </div>
                            </div>

                            {
                                this.state.passphraseStatus &&
                                <InfoBox danger mt>
                                    Incorect passphrase.
                                </InfoBox>
                            }

                            <button type="submit" className="btn btn-right">Enter</button>
                        </div>
                    </form>
                )} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    publicKey: state.account.publicKey
});

const mapDispatchToProps = dispatch => ({
    setModalData: (data) => dispatch(setModalData(data)),
    validatePassphrase: (passphrase) => dispatch(crypto.validatePassphrase(passphrase))
});

export default connect(mapStateToProps, mapDispatchToProps)(PrivateTransactions);
