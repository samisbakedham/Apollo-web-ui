import React from "react";
import {connect} from 'react-redux';
import {Link, NavLink} from 'react-router-dom';
import './SiteHeader.css';
import {setPageEvents} from '../../../modules/account';
import classNames from 'classnames';
import {setMopalType, setBodyModalType, setBodyModalParamsAction} from "../../../modules/modals";
import {logOutAction} from "../../../actions/login";
import {Form, Text} from 'react-form';
import PrivateTransactions from "../../modals/private-transaction";
import {switchAccountAction} from "../../../actions/account";
import {setForging} from '../../../actions/login';

import {setModalData} from "../../../modules/modals";
import {getAccountInfoAction} from "../../../actions/account";
import {getTransactionAction} from "../../../actions/transactions";
import {getBlockAction} from "../../../actions/blocks";
import {getForging} from "../../../actions/login"


import {
	Accordion,
	AccordionItem,
	AccordionItemTitle,
	AccordionItemBody,
} from 'react-accessible-accordion';

// Demo styles, see 'Styles' section below for some notes on use.
import 'react-accessible-accordion/dist/fancy-example.css';
import {NotificationManager} from "react-notifications";

class SiteHeader extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			searching: false,
			menuShow: false,
			isContacts: false,
			showTitleForginMenu: false,
			contacts: JSON.parse(localStorage.getItem('APLContacts')),
		};

		this.setSearchStateToActive = this.setSearchStateToActive.bind(this);
		this.resetSearchStateToActive = this.resetSearchStateToActive.bind(this);
		this.showMenu = this.showMenu.bind(this);
		this.closeMenu = this.closeMenu.bind(this);
		this.showHideTitleForginMenu = this.showHideTitleForginMenu.bind(this);
		this.searchInterval;
	}

	showMenu() {
		this.setState({menuShow: !this.state.menuShow});
	}

	closeMenu() {
		this.setState({menuShow: false});
	}

	showHideTitleForginMenu() {
		this.setState({showTitleForginMenu: !this.state.showTitleForginMenu});
	}

	getNavLinkClass = (path) => {
		return path.some(i => window.location.pathname === i) ? 'active' : '';
	};

	setSearchStateToActive() {
		clearInterval(this.searchInterval);
		this.setState({
			...this.state,
			searching: true
		});
	}

	resetSearchStateToActive() {
		this.searchInterval = setTimeout(() => {
			this.setState({
				...this.state,
				searching: false
			});
		}, 4000);
	}

	componentWillReceiveProps(newState) {
		this.setState({
			...this.state,
			forgingStatus: newState.forgingStatus,
		});
		this.getBlock()
	}

	componentDidMount() {
		this.getBlock()
	}

	setBodyModalType(bodyModalType) {
		if (this.props.bodyModalType) {

		} else {
			this.props.setBodyModalType(bodyModalType);
		}
	}

	handleSearchind = async (values) => {
		const transaction = await this.props.getTransactionAction({transaction: values.value});
		const block = await this.props.getBlockAction({block: values.value});
		const account = await this.props.getAccountInfoAction({account: values.value});

		if (transaction) {
			this.props.setBodyModalParamsAction('INFO_TRANSACTION', transaction)
		}

		if (block) {
			this.props.setBodyModalParamsAction('INFO_BLOCK', block)
		}

		if (account) {
			this.props.setModalData(account.account);
			this.props.setBodyModalParamsAction('INFO_ACCOUNT', account.account)
		}
	};

	getBlock = async () => {
		const block = await this.props.getBlockAction();

		if (block) {
			this.setState({
				block: block
			})
		}
	};

	setForging = async (action) => {
		this.props.setForging({requestType: action.requestType})
			.done(async (data) => {

				const forgingStatus = await this.props.getForging();

				if (forgingStatus) {
					this.setState({
						forgingStatus: forgingStatus
					});
				}
			})
	};

	render() {
		return (
			<div className="page-header">
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-6">
							<div className="page-title-box">
								<div className="page-title-box transactions-title">
									<h1 className="title">{this.props.pageTitle}</h1>
									{
										this.props.showPrivateTransactions &&
										!this.props.children &&
										<a
											className="btn primary"
											onClick={this.props.setMopalType.bind(this, 'PrivateTransactions')}
										>
											Show private transactions
										</a>
									}
									{
										this.props.children &&
										this.props.children
									}
									{
										this.props.dashboardPage &&
										<React.Fragment>
											<div
												onClick={this.setBodyModalType.bind(this, 'FORGING_BODY_MODAL')}
												className={classNames({
													"underscore": true,
													"general": true,
													"btn": true,
													"icon-button": true,
													"filters": true,
													"primary": true,
													"active": this.props.bodyModalType === "FORGING_BODY_MODAL",
													"revert-content": this.props.bodyModalType === "FORGING_BODY_MODAL",
													"transparent": true,
													"open-settings": true
												})}
											>
												<i className="to-revert zmdi zmdi-chevron-down"/>
												<div className={classNames({
													"settings-bar": true,
													"active": this.props.bodyModalType === "FORGING_BODY_MODAL",
													"no-padding": true
												})}>
													<div className="form-group-app">
														<div className="form-body">
															<div className="input-section">

																<div className="image-button success">
																	<i className="zmdi zmdi-check-circle"/>
																	<label>Connected</label>
																</div>

																{
																	this.state.forgingStatus &&
																	this.state.forgingStatus.errorCode === 5 &&
																	<a
																		onClick={() => this.setForging({requestType: 'startForging'})}
																		className="image-button  danger"
																	>
																		<i className="zmdi zmdi-close-circle"/>
																		<label>Not forging</label>
																	</a>
																}
																{
																	this.state.forgingStatus &&
																	!this.state.forgingStatus.errorCode &&
																	<a
																		onClick={() => this.setForging({requestType: 'stopForging'})}
																		className="image-button  success"
																	>
																		<i className="zmdi zmdi-check-circle"/>
																		<label>Forging</label>
																	</a>
																}
																{
																	this.state.forgingStatus &&
																	this.state.forgingStatus.errorCode === 8 &&
																	<a
																		onClick={() => this.props.setBodyModalParamsAction('ENTER_SECRET_PHRASE', null)}
																		className="image-button danger"
																	>
																		<i className="zmdi zmdi-help"/>
																		<label>Unknown forging status</label>
																	</a>
																}


																<a
																	to="/messenger"
																	className="image-button"
																>
																	<i className="zmdi"/>
																	{
																		this.state.block &&
																		<label>Height: {this.state.block.height}</label>
																	}
																</a>
																<a
																	onClick={() => this.props.setBodyModalParamsAction('ACCOUNT_DETAILS')}
																	className="image-button"
																>
																	<i className="zmdi"/>
																	{
																		this.props.forgedBalanceATM &&
																		<label>Apollo: {(this.props.forgedBalanceATM / 100000000).toLocaleString('en')}</label>
																	}
																</a>

															</div>
														</div>
													</div>
												</div>

											</div>
											<div
												onClick={this.showHideTitleForginMenu}
												className={classNames({
													"underscore": true,
													"general": true,
													"btn": true,
													"icon-button": true,
													"filters": true,
													"primary": true,
													"active": this.state.showTitleForginMenu === true,
													"revert-content": this.state.showTitleForginMenu === true,
													"transparent": true,
													"open-settings": true,
													"mobile-btn": true
												})}
											>
												<i className="to-revert zmdi zmdi-chevron-down"/>
												<div className={classNames({
													"settings-bar": true,
													"active": this.props.bodyModalType === "FORGING_BODY_MODAL",
													"no-padding": true
												})}>
													<div className="form-group-app">
														<div className="form-body">
															<div className="input-section">
																<div className="image-button success">
																	<i className="zmdi zmdi-check-circle"/>
																	<label>Connected</label>
																</div>
																<a
																	to="/messenger"
																	className="image-button  danger"
																>
																	<i className="zmdi zmdi-close-circle"/>
																	<label>Not forging</label>
																</a>
																<a
																	to="/messenger"
																	className="image-button"
																>
																	<i className="zmdi"/>
																	{
																		this.state.block &&
																		<label>Height: {this.state.block.height}</label>
																	}
																</a>
																<a
																	onClick={() => this.props.setBodyModalParamsAction('ACCOUNT_DETAILS')}
																	className="image-button"
																>
																	<i className="zmdi"/>
																	{
																		this.props.forgedBalanceATM &&
																		<label>Apollo: {(this.props.forgedBalanceATM / 100000000).toLocaleString('en')}</label>
																	}
																</a>

															</div>
														</div>
													</div>
												</div>

											</div>
										</React.Fragment>
									}

									<div className="breadcrumbs">
										<a>Apollo Wallet /</a>
										<strong>
											<a>{this.props.pageTitle}</a>
										</strong>
									</div>
									<div
										className={`form-group-app mobile-form-group-app ${this.state.showTitleForginMenu ? "show" : ""}`}>
										<div className="form-body">
											<div className="input-section">
												<div className="image-button success">
													<i className="zmdi zmdi-check-circle"/>
													<label>Connected</label>
												</div>
												<a
													to="/messenger"
													className="image-button  danger"
												>
													<i className="zmdi zmdi-close-circle"/>
													<label>Not forging</label>
												</a>
												<a
													to="/messenger"
													className="image-button"
												>
													<i className="zmdi"/>
													{
														this.state.block &&
														<label>Height: {this.state.block.height}</label>
													}
												</a>
												<a
													onClick={() => this.props.setBodyModalParamsAction('ACCOUNT_DETAILS')}
													className="image-button"
												>
													<i className="zmdi"/>
													{
														this.props.forgedBalanceATM &&
														<label>Apollo: {(this.props.forgedBalanceATM / 100000000).toLocaleString('en')}</label>
													}
												</a>

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-md-6">
							<div className={classNames({
								"user-search-box": true,
								"searching": this.state.searching
							})}>
								{/*TODO : fix site header search animation*/}
								<a className="logo" href={"/"}><img src="./apollo-logo.svg"/></a>
								<div className={`burger-mobile ${this.state.menuShow ? "menu-open" : ""}`}
								     onClick={this.showMenu}>
									<div className="line"/>
								</div>
								<div className={`mobile-nav ${this.state.menuShow ? "show" : ""}`}>
									<Accordion>
										<AccordionItem>
											<div className={`mobile-nav-item`}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/dashboard",
														"/ledger",
														"/account-properties",
														"/transactions",
														"/approval-request"])
														}`}>
													<i className="zmdi zmdi-view-dashboard"/>Dashboard<span
													className="arrow"/>
												</AccordionItemTitle>

												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink exact={true} activeClassName="active"
														         to="/dashboard">Dashboard</NavLink>
														<NavLink exact={true} activeClassName="active" to="/ledger">Account
															ledger</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/account-properties">Account
															properties</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/transactions">My
															transactions</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/approval-request">Approval
															requests</NavLink>
													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/trade-history",
														"/transfer-history",
														"/delete-history",
														"/my-assets",
														"/open-orders",
														"approval-request"])}`}>
													<i className="zmdi zmdi-case"/>Asset system<span
													className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink exact={true} activeClassName="active"
														         to="/trade-history">Trade history</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/transfer-history">Transfer history</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/delete-history">Delete history</NavLink>
														<NavLink exact={true} activeClassName="active" to="/my-assets">My
															Assets</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="/open-orders">Open orders</NavLink>
														<NavLink exact={true} activeClassName="active"
														         to="approval-request">Approval request</NavLink>

														<a onClick={this.props.setMopalType.bind(this, 'ISSUE_ASSET')}>Issue
															Assets</a>

													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/currencies",
														"/my-shuffling",
														"/transfer-history-currency",
														"/trade-history-currency"])}`}>
													<i className="zmdi zmdi-money"/>Currency system<span
													className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink to="/currencies">Currencies</NavLink>
														<NavLink to="/my-shuffling">Exchange history</NavLink>
														<NavLink to="/transfer-history-currency">Transfer
															history</NavLink>
														<NavLink to="/trade-history-currency">Approval
															requests</NavLink>

														<a onClick={this.props.setMopalType.bind(this, 'ISSUE_CURRENCIES')}>Issue
															Currencies</a>

													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/active-polls",
														"/followed-polls",
														"/my-votes",
														"/my-polls"])}`}>
													<i className="zmdi zmdi-star"/>Voting system
													<span className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink to="/active-polls">Active polls</NavLink>
														<NavLink to="/followed-polls">Followed polls</NavLink>
														<NavLink to="/my-votes">My votes</NavLink>
														<NavLink to="/my-polls">My polls</NavLink>

														<a onClick={this.props.setMopalType.bind(this, 'ISSUE_POLL')}>Create
															poll</a>

													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/data-storage"])}`}>
													<i className="zmdi zmdi-dns"/>Data storage<span className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink to="/data-storage">Search</NavLink>

														<a onClick={this.props.setMopalType.bind(this, 'ISSUE_FILE_UPLOAD')}>File
															upload</a>

													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/my-products-for-sale",
														"/my-panding-orders",
														"/my-completed-orders"])}`}>
													<i className="zmdi zmdi-label"/>Marketplace<span className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<a>Purchased Products</a>
														<NavLink to="/my-products-for-sale">My Products For
															Sales</NavLink>
														<NavLink to="/my-panding-orders">My Pending Orders</NavLink>
														<NavLink to="/my-completed-orders">My completed orders</NavLink>
														<a
															onClick={this.props.setMopalType.bind(this, 'LIST_PRODUCT_FOR_SALE')}>List
															Product For Sale</a>
													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/active-shuffling",
														"/finished-shuffling",
														"/my-shuffling"])}`}>
													<i className="zmdi zmdi-circle-o"/>Coin shuffling
													<span className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink to="/active-shuffling">Active Shuffling</NavLink>
														<NavLink to="/finished-shuffling">Finished Shuffling</NavLink>
														<NavLink to="/my-shuffling">My shuffling</NavLink>

														<a onClick={this.props.setMopalType.bind(this, 'ISSUE_CREATE_SHUFFLING')}>Create
															shuffling</a>

													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
										<AccordionItem>
											<div className={"mobile-nav-item"}>
												<AccordionItemTitle
													className={`text ${this.getNavLinkClass(["/messenger"])}`}>
													<i className="zmdi zmdi-comments"/>Messages<span className="arrow"/>
												</AccordionItemTitle>
												<AccordionItemBody>
													<div className="item-dropdown">
														<NavLink exact={true} activeClassName="active"
														         to="/messenger">Chat</NavLink>
													</div>
												</AccordionItemBody>
											</div>

										</AccordionItem>
									</Accordion>

									<NavLink exact={true} activeClassName="active" to="/aliases"
									         className={"mobile-nav-item"}>
										<p className="text">Aliases <i className="zmdi zmdi-accounts"/></p>
									</NavLink>
									{/*<NavLink exact={true} activeClassName="active" to="/plugins"
									         className={"mobile-nav-item"}>
										<p className="text">Plugins <i className="zmdi zmdi-input-power"/></p>
									</NavLink>*/}
									<div className="btn-block">
										<div className="close-menu-btn" onClick={this.closeMenu}>
											Close
										</div>
									</div>

								</div>
								<div
									className={classNames({
										'search-bar': true,
									})}
								>

									<Form
										onSubmit={values => this.handleSearchind(values)}
										render={({submitForm}) => (
											<form onSubmit={submitForm}>
												<Text
													field={'value'}
													onMouseOut={this.resetSearchStateToActive}
													onMouseDown={this.setSearchStateToActive}
													onMouseOver={this.setSearchStateToActive}
													className={"searching-window"}
													type="text"
													placeholder="Enter Transaction/Account/Block ID"
												/>
											</form>
										)}
									/>


									<div className="user-account-actions">
										<a
											className="user-account-rs"
										>
											{this.props.accountRS}
										</a>
										<a
											className="user-account-action"
											onClick={this.props.setMopalType.bind(this, 'SEND_APOLLO')}
										>
											<i className="zmdi zmdi-balance-wallet"/>
										</a>
										<div
											style={{height: 32}}
											className={classNames({
												"underscore": true,
												"settings": true,
												"btn": true,
												"icon-button": true,
												"filters": true,
												"primary": true,
												"active": this.props.bodyModalType === "SETTINGS_BODY_MODAL",
												"transparent": true,
												"open-settings": true,
												"icon-button ": true,
												"user-account-action": true
											})}
											onClick={this.setBodyModalType.bind(this, 'SETTINGS_BODY_MODAL')}
										>
											<i className="zmdi zmdi-settings"/>
											<div className={classNames({
												"settings-bar": true,
												"settings-menu": true,
												"active": this.props.bodyModalType === 'SETTINGS_BODY_MODAL'
											})}>
												<div className="options-col">
													<ul>
														<li><Link onClick={() => this.props.setBodyModalType(null)} className="option" to="/blocks">Blocks</Link></li>
														<li><Link onClick={() => this.props.setBodyModalType(null)} className="option" to="/peers">Peers</Link></li>
														<li><Link onClick={() => this.props.setBodyModalType(null)} className="option" to="/generators">Generators</Link>
														</li>
														<li><Link onClick={() => this.props.setBodyModalType(null)} className="option" to="/scheduled-transactions">Scheduled
															transactions</Link></li>
														<li><Link className="option" onClick={() => this.props.setBodyModalType(null)}
														          to="/funding-monitors">Monitors</Link></li>
													</ul>
												</div>
												<div className="options-col">
													<ul>
														<li><a
															onClick={() => {
                                                                this.props.setBodyModalType(null);
                                                                return this.props.setBodyModalParamsAction('TOKEN_GENERATION_VALIDATION');
                                                            }}
															className="option">Generate token</a></li>
														<li><a
															onClick={() => {
                                                                this.props.setBodyModalType(null);
                                                                return this.props.setBodyModalParamsAction('GENERATE_HALLMARK');
                                                            }}
															className="option">Generate hallmark</a></li>
														<li><a
															onClick={() => {
                                                                this.props.setBodyModalType(null);
                                                                return this.props.setBodyModalParamsAction('CALCULATE_CACHE');
                                                            }}
															className="option">Calculate hash</a></li>
														<li><a
															onClick={() => {
                                                                this.props.setBodyModalType(null);
                                                                return this.props.setBodyModalParamsAction('TRANSACTIONS_OPERATIONS');
                                                            }}
															className="option">Transaction operations</a></li>
													</ul>

												</div>
												<div className="options-col">
													<ul>
														<li><a onClick={() => this.props.setBodyModalType(null)} className="option">Refresh search index</a></li>
														<li><a href="https://apollowallet.org/test" className="option">API
															console</a></li>
														<li><a href="https://apollowallet.org/dbshell"
														       className="option">Database shell</a></li>
													</ul>
												</div>
												<div className="options-col">
													<ul>
														{/*
														<li><Link to="/plugins" className="option">Plugins</Link></li>
*/}
														{/*<li><Link onClick={() => this.props.setBodyModalType(null)} to="/settings" className="option">Account
															settings</Link></li>*/}
														<li><a
															onClick={() => {
                                                                this.props.setBodyModalType(null);
                                                                return this.props.setBodyModalParamsAction('DEVICE_SETTINGS');
                                                            }}
															className="option">Device settings</a></li>
													</ul>
												</div>
											</div>
										</div>
										<a
											onClick={() => this.props.setMopalType('GENERAL_INFO')}
											className="user-account-action user-account-action--help"
										>
											<i className="zmdi zmdi-help"/>
										</a>
										<a className="user-account-action search-button"
										   onClick={this.setSearchStateToActive}>
											<i className="zmdi zmdi-search"/>
										</a>
									</div>
								</div>
								<div
									onClick={this.setBodyModalType.bind(this, 'ACCOUNT_BODY_MODAL')}
									className="user-box"
								>
									<div
										className="user-name"
									>
										<a
											style={{
												height: 25,
												width: 25,
												margin: "0 15px 0 0"
											}}
											className={classNames({
												"underscore": true,
												"account": true,
												"btn": true,
												"icon-button": true,
												"filters": true,
												"primary": true,
												"active": this.props.bodyModalType === "ACCOUNT_BODY_MODAL",
												"revert-content ": this.props.bodyModalType === "ACCOUNT_BODY_MODAL",
												"transparent": true,
												"open-settings": true,
												"icon-button ": true,
												"user-account-action": true
											})}
										>
											<i className="to-revert zmdi zmdi-chevron-down"/>
										</a>
										<a className={"name"}>{this.props.name}</a>

									</div>
									<div className="user-avatar"/>
									<div className={classNames({
										"settings-bar": true,
										"active": this.props.bodyModalType === 'ACCOUNT_BODY_MODAL',
										"no-padding": true,
										"account-body-modal": true
									})}>
										<div className="form-group-app">
											<div className="form-title">
												<p>Current account</p>
											</div>
											{
												!this.props.publicKey &&
												<div className="form-sub-title">
													Not verified profile
												</div>
											}
											{
												this.props.publicKey &&
												<div className="form-sub-title">
													Verified profile
												</div>
											}
											<div className="form-body">
												<div className="input-section">
													<div className="row" style={{position: 'relative'}}>
														<div className="col-xc-12 col-md-6">
															<a
																onClick={() => this.props.setBodyModalParamsAction('SET_ACCOUNT_INFO', {})}
																className="btn static blue block"
															>
																Set account info
															</a>
														</div>
														<div className="col-xc-12 col-md-6">
															<a
																onClick={() => {

																	if (this.state.contacts && this.state.contacts.length) {
																		this.setState({isContacts: !this.state.isContacts})
																	} else {
																		NotificationManager.info('You have an empty contacts list.', null, 5000)
																	}
																}
																}
																className="btn static block"
															>
																Switch account
															</a>
														</div>
														<div
															className={classNames({
																'contacts-list': true,
																'active': this.state.isContacts
															})}
															style={{
																padding: 0,
																margin: 5
															}}
														>
															<ul>
																{
																	this.state.contacts &&
																	this.state.contacts.length &&
																	this.state.contacts.map((el, index) => {
																		return (
																			<li>
																				<a
																					onClick={() => this.props.switchAccountAction(el.accountRS)}
																				>
																					{el.name}
																				</a>
																			</li>
																		)
																	})
																}
															</ul>
														</div>
													</div>
												</div>
												<div className="input-section">
													<a
														style={{
															display: 'block'
														}}
														onClick={() => this.props.setBodyModalParamsAction('INFO_ACCOUNT', this.props.account)}
														className="image-button"
													>
														<i className="zmdi zmdi-account"/>
														<label style={{cursor: 'pointer'}}>Details</label>
													</a>
													<Link
														to="/messenger"
														className="image-button"
													>
														<i className="zmdi zmdi-comments"/>
														<label style={{cursor: 'pointer'}}>Messages</label>
													</Link>

												</div>
												{/*<div className="input-section">
													<Link
														to="/settings"
														className="image-button"
													>
														<i className="zmdi zmdi-settings"/>
														<label style={{cursor: 'pointer'}}>Settings</label>
													</Link>

												</div>*/}
												<div className="input-section">
													<div
														onClick={() => logOutAction('simpleLogOut')}
														className="image-button">
														<i className="zmdi zmdi-power"/>
														<label style={{cursor: 'pointer'}}>Logout</label>
													</div>
													<div
														onClick={() => logOutAction('logOutStopForging')}
														className="image-button"
													>
														<i className="zmdi zmdi-pause-circle"/>
														<label style={{cursor: 'pointer'}}>Logout and stop
															forging</label>
													</div>
													<div
														onClick={() => logOutAction('logoutClearUserData')}
														className="image-button"
													>
														<i className="zmdi zmdi-close-circle"/>
														<label style={{cursor: 'pointer'}}>Logout and clear user
															data</label>
													</div>
												</div>
											</div>
										</div>
									</div>
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
	accountRS: state.account.accountRS,
	name: state.account.name,
	forgingStatus: state.account.forgingStatus,
	publicKey: state.account.publicKey,
	forgedBalanceATM: state.account.forgedBalanceATM,
	moalTtype: state.modals.modalType,
	bodyModalType: state.modals.bodyModalType,
	secretPhrase: state.account.passPhrase
});

const mapDispatchToProps = dispatch => ({
	setPageEvents: (prevent) => dispatch(setPageEvents(prevent)),
	setMopalType: (prevent) => dispatch(setMopalType(prevent)),
	setBodyModalType: (prevent) => dispatch(setBodyModalType(prevent)),
	getAccountInfoAction: (reqParams) => dispatch(getAccountInfoAction(reqParams)),
	setForging: (reqParams) => dispatch(setForging(reqParams)),
	getTransactionAction: (reqParams) => dispatch(getTransactionAction(reqParams)),
	getBlockAction: (reqParams) => dispatch(getBlockAction(reqParams)),
	setModalData: (reqParams) => dispatch(setModalData(reqParams)),
	getForging: (reqParams) => dispatch(getForging(reqParams)),
	switchAccountAction: (requestParams) => dispatch(switchAccountAction(requestParams)),
	setBodyModalParamsAction: (type, data) => dispatch(setBodyModalParamsAction(type, data))
});


export default connect(mapStateToProps, mapDispatchToProps)(SiteHeader);