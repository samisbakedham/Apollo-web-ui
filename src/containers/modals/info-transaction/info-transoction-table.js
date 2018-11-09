import React, {Component} from "react";
import {formatTransactionType} from "../../../actions/transactions";
import {connect} from "react-redux";

import CurrencyIssuance from "./table-content/currency-issuance";
import BuyCurrency from "./table-content/exchange-buy";
import CurrencyTransfer from "./table-content/currency-transfer";
import CurrencyExchangeOffer from "./table-content/publish-exchange-offer";
import ShufflingCreation from "./table-content/shuffling-creation";
import ShufflingRegistarion from "./table-content/shuffling-registration";
import ShufflingVerification from "./table-content/shuffling-verification";
import ShufflingProcessing from "./table-content/shuffling-processing";
import OrdinaryPayment from "./table-content/ordinary-payment";
import PrivatePayment from "./table-content/private-payment";
import TargetDataUpload from "./table-content/target-data-upload";
import AccountProperty from "./table-content/account-property";
import AccountPropertyDelete from "./table-content/account-property-delete";
import AliasDelete from "./table-content/alias-delete";
import VoteCasting from "./table-content/vote-casting";
import ArbitraryMessage from "./table-content/arbitrary-message";
import EffectiveBalanceLeasing from "./table-content/effective-balance-leasing";
import AliasAssignment from "./table-content/alias-assignment";
import AccountInfo from "./table-content/account-info";
import PollCreation from "./table-content/poll-creation";
import AliasSell from "./table-content/alias-sell";
import PhasingVoteCasting from "./table-content/phasing-vote-casting";


class InfoTransactionTable extends Component {

	render() {
		const modalTypeName = formatTransactionType(this.props.constants.transactionTypes[this.props.transaction.type].subtypes[this.props.transaction.subtype].name);

		console.log('22222', modalTypeName);
		console.log("yayayay", this.props.transaction);

		return (
			<div className="transaction-table-body transparent">
				{
					this.props.transaction && this.props.constants.transactionTypes &&
					<table>
						<tbody>
						<tr>
							<td>Type:</td>
							<td>{formatTransactionType(this.props.constants.transactionTypes[this.props.transaction.type].subtypes[this.props.transaction.subtype].name)}</td>
						</tr>




						{modalTypeName === "CURRENCY ISSUANCE" && <CurrencyIssuance transaction={this.props.transaction}/>}

						{modalTypeName === "EXCHANGE BUY" && <BuyCurrency transaction={this.props.transaction}/>}

						{modalTypeName === "CURRENCY TRANSFER" && <CurrencyTransfer transaction={this.props.transaction}/>}

						{modalTypeName === "PUBLISH EXCHANGE OFFER" && <CurrencyExchangeOffer transaction={this.props.transaction}/>}

						{modalTypeName === "SHUFFLING CREATION" && <ShufflingCreation transaction={this.props.transaction}/>}

						{modalTypeName === "SHUFFLING REGISTRATION" && <ShufflingRegistarion transaction={this.props.transaction}/>}

						{modalTypeName === "SHUFFLING VERIFICATION" && <ShufflingVerification transaction={this.props.transaction}/>}

						{modalTypeName === "SHUFFLING PROCESSING" && <ShufflingProcessing transaction={this.props.transaction}/>}

						{modalTypeName === "ORDINARY PAYMENT" && <OrdinaryPayment transaction={this.props.transaction}/>}

						{modalTypeName === "PRIVATE PAYMENT" && <PrivatePayment transaction={this.props.transaction}/>}

						{modalTypeName === "TAGGED DATA UPLOAD" && <TargetDataUpload transaction={this.props.transaction}/>}

						{modalTypeName === "ACCOUNT PROPERTY" && <AccountProperty transaction={this.props.transaction}/>}

						{modalTypeName === "ACCOUNT PROPERTY DELETE" && <AccountPropertyDelete transaction={this.props.transaction}/>}

						{modalTypeName === "ALIAS DELETE" && <AliasDelete transaction={this.props.transaction}/>}

						{modalTypeName === "VOTE CASTING" && <VoteCasting transaction={this.props.transaction}/>}

						{modalTypeName === "ARBITRARY MESSAGE" && <ArbitraryMessage transaction={this.props.transaction}/>}

						{modalTypeName === "EFFECTIVE BALANCE LEASING" && <EffectiveBalanceLeasing transaction={this.props.transaction}/>}

						{modalTypeName === "ALIAS ASSIGNMENT" && <AliasAssignment transaction={this.props.transaction}/>}

						{modalTypeName === "ACCOUNT INFO" && <AccountInfo transaction={this.props.transaction}/>}

						{modalTypeName === "POLL CREATION" && <PollCreation transaction={this.props.transaction}/>}

						{modalTypeName === "ALIAS SELL" && <AliasSell transaction={this.props.transaction}/>}

						{modalTypeName === "PHASING VOTE CASTING" && <PhasingVoteCasting transaction={this.props.transaction}/>}


						{console.log("5555", this.props.transaction)}
						</tbody>
					</table>
				}
			</div>
		);
	}
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoTransactionTable);
