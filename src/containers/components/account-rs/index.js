import React from 'react';
import InputMask from 'react-input-mask';
import classNames from 'classnames';


class AccountRS extends React.Component {
    constructor(props) {
        super(props)
    };

    state = {
        contacts: JSON.parse(localStorage.getItem('APLContacts')),
        isContacts: false
    };

    handleFillForm = (account) => {
        this.props.setValue(this.props.field, account);
        this.refs.input.value = account;
        console.log(this.refs.input.value);
        this.setState({
            isContacts: false
        })
    };

    handleContacts = () => {
        this.setState({
            isContacts: !this.state.isContacts
        })
    };

    render () {
        console.log(this.state.contacts);
        return (
            <React.Fragment>
                <InputMask mask='APL-****-****-****-*****' placeholder={'Account RS'} ref={'input'} value={this.props.defaultValue} onChange={(e) => {
                    if (e.target) {
                        var value = e.target.value;
                        var newState = {
                            mask: 'APL-****-****-****-*****',
                            value: value.toUpperCase()
                        };

                        if (/^APL-[A-Z0-9_]{4}-[A-Z0-9_]{4}-[A-Z0-9_]{4}-[A-Z0-9_]{5}/.test(value)) {
                            newState.value = 'APL-****-****-****-*****';
                        }
                        if (/^APL-/.test(e.target.value)) {
                        }
                        this.props.setValue(this.props.field, value);
                    }
                }}
                >
                </InputMask>
                <a
                    onClick={() => this.handleContacts()}
                    className="input-icon"
                >
                    <i className="zmdi zmdi-account" />
                </a>
                <div
                    className={classNames({
                        'contacts-list': true,
                        'active': this.state.isContacts
                    })}
                >
                    <ul>
                        {
                            this.state.contacts &&
                            this.state.contacts.map((el, index) => {
                                return (
                                    <li>
                                        <a onClick={() => this.handleFillForm(el.accountRS)}>
                                            {el.name}
                                        </a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </React.Fragment>

        )
    }
}

export default AccountRS;