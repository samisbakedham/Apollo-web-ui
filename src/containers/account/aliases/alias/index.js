import React from 'react';
import {connect} from 'react-redux';
import {setBodyModalParamsAction} from "../../../../modules/modals";

const Alias = (props) => (
    <tr>
        <td>{props.aliasName}</td>
        <td className="blue-link-text"><a>{props.aliasURI}</a></td>
        <td>Registered</td>
        <td className="align-right">
            <div className="btn-box inline">
                <a
                    onClick={() => props.setBodyModalParamsAction('EDIT_ALIAS', props.alias)}
                    className="btn primary blue"
                >
                    Edit
                </a>
                <a
                    className="btn primary blue"
                    onClick={() => props.setBodyModalParamsAction('TRANSFER_ALIAS', props.alias)}
                >
                    Transfer</a>
                <a
                    className="btn primary blue"
                    onClick={() => props.setBodyModalParamsAction('SELL_ALIAS', props.alias)}
                >
                    Sell</a>
                <a
                    className="btn primary"
                    onClick={() => props.setBodyModalParamsAction('DELETE_ALIAS', props.alias)}
                >
                    Delete</a>
            </div>
        </td>
    </tr>
);

const mapStateToProps = () => {

};

const mapDispatchToProps = dispatch => ({
    setBodyModalParamsAction: (type, data) => dispatch(setBodyModalParamsAction(type, data))
});

export default connect(null, mapDispatchToProps)(Alias);