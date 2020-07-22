import React, {
  useEffect, useState, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Formik, Form, useFormikContext,
} from 'formik';
import cn from 'classnames';
import { NotificationManager } from 'react-notifications';
import {
  currencyTypes, multiply, division,
} from '../../../../../helpers/format';
import {
  setBodyModalParamsAction, resetTrade, setSelectedOrderInfo,
} from '../../../../../modules/modals';
import { ReactComponent as ArrowRight } from '../../../../../assets/arrow-right.svg';
import { createOffer } from '../../../../../actions/wallet';
import { ONE_GWEI } from '../../../../../constants';
import InputForm from '../../../../components/input-form';
import CustomSelect from '../../../../components/select';
import InputRange from '../../../../components/input-range';
import getFullNumber from '../../../../../helpers/util/expancionalParser';

const feeATM = 200000000;

export default function BuyForm(props) {
  const dispatch = useDispatch();

  const { setValues, values } = useFormikContext();

  const { currentCurrency } = useSelector(state => state.exchange);
  const { dashboardAccoountInfo } = useSelector(state => state.dashboard);
  const { infoSelectedBuyOrder } = useSelector(state => state.modals);
  const { unconfirmedBalanceATM: balanceAPL, account, passPhrase } = useSelector(state => state.account);

  const { wallet, handleLoginModal, ethFee } = props;

  const [isPending, setIsPending] = useState(false);
  const [newCurrentCurrency, setNewCurrentCurrency] = useState(null);
  const [newWallet, setNewWallet] = useState(null);
  const [walletsList, setWalletsList] = useState(null);

  const { currency } = currentCurrency;

  const setPending = useCallback((value = true) => { setIsPending(value); }, []);

  const handleFormSubmit = useCallback(newValues => {
    if (!isPending) {
      const pairRateInfo = multiply(newValues.pairRate, ONE_GWEI);
      const offerAmountInfo = multiply(newValues.offerAmount, ONE_GWEI);
      const totalInfo = pairRateInfo * offerAmountInfo;
      dispatch(setSelectedOrderInfo({
        pairRate: pairRateInfo,
        offerAmount: offerAmountInfo,
        total: totalInfo,
        type: 'BUY',
      }));
      setPending();
      if (wallet) {
        if (newValues.offerAmount > 0 && newValues.pairRate > 0) {
          const balance = newValues.walletAddress && newValues.walletAddress.balances[currency];
          let isError = false;
          if (+newValues.pairRate < 0.000000001) {
            NotificationManager.error(`Price must be more then 0.000000001 ${currency.toUpperCase()}`, 'Error', 5000);
            isError = true;
          }
          if (+newValues.offerAmount < 0.001) {
            NotificationManager.error('You can buy more then 0.001 APL', 'Error', 5000);
            isError = true;
          }
          if (!newValues.walletAddress || !newValues.walletAddress.balances) {
            NotificationManager.error('Please select wallet address', 'Error', 5000);
            isError = true;
          }
          if (+newValues.total > +balance) {
            NotificationManager.error(`You need more ${currency.toUpperCase()}. Please check your wallet balance.`, 'Error', 5000);
            isError = true;
          }
          if (+ethFee > +newValues.walletAddress.balances.eth) {
            NotificationManager.error(`To buy APL you need to have at least ${ethFee.toLocaleString('en', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 9,
            })} ETH on your balance to confirm transaction`, 'Error', 5000);
            isError = true;
          }
          if (isError) {
            setPending(false);
            return;
          }
          const pairRate = Math.round(multiply(newValues.pairRate, ONE_GWEI));
          const offerAmount = multiply(newValues.offerAmount, ONE_GWEI);
          const balanceETH = parseFloat(newValues.walletAddress.balances[currency]);
          const currentBalanceAPL = (dashboardAccoountInfo && dashboardAccoountInfo.unconfirmedBalanceATM)
            ? parseFloat(dashboardAccoountInfo.unconfirmedBalanceATM)
            : parseFloat(balanceAPL);
          const fixedOfferAmount = offerAmount.toFixed();
          const checkFee = currency === 'eth' ? newValues.total + ethFee : ethFee;
          if (checkFee > balanceETH) {
            NotificationManager.error('Not enough founds on your ETH balance. You need to pay Gas fee', 'Error', 5000);
            setPending(false);
            return;
          }
          if (balanceETH === 0 || balanceETH < newValues.total) {
            NotificationManager.error(`Not enough founds on your ${currency.toUpperCase()} balance.`, 'Error', 5000);
            setPending(false);
            return;
          }
          if (!balanceAPL || currentBalanceAPL === 0 || currentBalanceAPL < feeATM) {
            NotificationManager.error('Not enough funds on your APL balance. You need to pay 2 APL fee.', 'Error', 5000);
            setPending(false);
            return;
          }
          const params = {
            offerType: 0, // BUY
            pairCurrency: currencyTypes[currency],
            pairRate,
            offerAmount: fixedOfferAmount,
            sender: account,
            passphrase: passPhrase,
            feeATM,
            walletAddress: newValues.walletAddress.address,
          };
          if (passPhrase) {
            dispatch(createOffer(params)).then(() => {
              setPending(false);
            });
            dispatch(resetTrade());
            setValues({
              walletAddress: newValues.walletAddress,
              pairRate: '',
              offerAmount: '',
              total: '',
            });
          } else {
            dispatch(setBodyModalParamsAction('CONFIRM_CREATE_OFFER', {
              params,
              resetForm: () => {
                dispatch(resetTrade());
                setValues({
                  walletAddress: newValues.walletAddress,
                  pairRate: '',
                  offerAmount: '',
                  total: '',
                });
              },
            }));
            setPending(false);
          }
        } else {
          NotificationManager.error('Price and amount are required', 'Error', 5000);
          setPending(false);
        }
      } else {
        setPending(false);
        handleLoginModal();
      }
    }
  }, [
    account, balanceAPL, dashboardAccoountInfo, dispatch, ethFee, handleLoginModal,
    isPending, passPhrase, setPending, setValues, wallet, currency,
  ]);

  useEffect(() => {
    if (currentCurrency && (currency !== newCurrentCurrency || wallet !== newWallet)) {
      setValues({
        walletAddress: values.walletAddress,
        pairRate: '',
        offerAmount: '',
        total: '',
      });
    }

    let currentWalletsList = wallet || [];
    currentWalletsList = currentWalletsList.map(currWallet => (
      {
        value: currWallet,
        label: currWallet.address,
      }
    ));

    setNewCurrentCurrency(currency);
    setNewWallet(wallet);
    setWalletsList(currentWalletsList);
  }, [
    currency, currentCurrency, newCurrentCurrency,
    newWallet, setValues, values.walletAddress, wallet,
  ]);

  useEffect(() => {
    if (infoSelectedBuyOrder) {
      const { pairRate, offerAmount, total } = infoSelectedBuyOrder;
      const balance = wallet && wallet[0].balances[currency];
      const normalizePairRate = !pairRate ? 0 : division(pairRate, ONE_GWEI, 9);
      const normalizeOfferAmount = !offerAmount ? 0 : division(offerAmount, ONE_GWEI, 9);
      const normalizeTotal = !total ? 0 : division(total, Math.pow(10, 18), 9);
      const rangeValue = ((normalizePairRate * normalizeOfferAmount) * 100 / balance).toFixed(0);
      setValues({
        walletAddress: wallet && wallet[0],
        pairRate: normalizePairRate,
        offerAmount: normalizeOfferAmount,
        total: normalizeTotal,
        range: rangeValue === 'NaN' ? 0 : rangeValue > 100 ? 100 : rangeValue,
      });
    }
  }, [currency, infoSelectedBuyOrder, setValues, wallet]);

  const currencyName = currency.toUpperCase();
  return (
    <Formik
      onSubmit={handleFormSubmit}
    >
      {({ setValue, values }) => {
        let balance = values.walletAddress && values.walletAddress.balances[currency];
        balance = currency === 'eth' ? balance - ethFee : balance;
        balance = balance < 0 ? 0 : balance;
        return (
          <Form className="form-group-app d-flex flex-column justify-content-between h-100 mb-0">
            {walletsList && !!walletsList.length && (
              <div className="form-group mb-3">
                <label>
                  {currencyName}
                  {' '}
                  Wallet
                </label>
                <CustomSelect
                  className="form-control"
                  field="walletAddress"
                  defaultValue={walletsList[0]}
                  setValue={setValue}
                  options={walletsList}
                />
              </div>
            )}
            <div className="form-group mb-3">
              <label>
                Price for 1 APL
              </label>
              <div className="input-group">
                <InputForm
                  field="pairRate"
                  type="float"
                  onChange={price => {
                    const amount = values.offerAmount || 0;
                    let rangeValue = ((amount * price) * 100 / balance).toFixed(0);
                    if (rangeValue > 100) rangeValue = 100;
                    setValue('offerAmount', amount);
                    setValue('range', rangeValue === 'NaN' ? 0 : rangeValue);
                    setValue('total', multiply(amount, price));
                  }}
                  setValue={setValue}
                  disableArrows
                />
                <div className="input-group-append">
                  <span className="input-group-text">{currencyName}</span>
                </div>
              </div>
            </div>
            <div className="form-group mb-3">
              <label>
                I want to Buy
              </label>
              <div
                className="input-group"
              >
                <InputForm
                  field="offerAmount"
                  type="float"
                  onChange={amount => {
                    const pairRate = +values.pairRate || 0;
                    let rangeValue = ((amount * pairRate) * 100 / balance).toFixed(0);
                    if (rangeValue > 100) rangeValue = 100;
                    setValue('offerAmount', amount);
                    setValue('range', rangeValue === 'NaN' ? 0 : rangeValue);
                    setValue('total', multiply(amount, pairRate));
                  }}
                  // maxValue={values.pairRate ? balance/values.pairRate : null}
                  setValue={setValue}
                  disableArrows
                />
                <div className="input-group-append">
                  <span className="input-group-text">APL</span>
                </div>
              </div>
            </div>
            <div className="form-group mb-3">
              <label>
                I will pay
              </label>
              <div className="input-group">
                <InputForm
                  field="total"
                  type="float"
                  setValue={setValue}
                  disabled
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    {values.walletAddress && (
                      <span className="input-group-info-text">
                        <i className="zmdi zmdi-balance-wallet" />
                        &nbsp;
                        {(getFullNumber(Number(values.walletAddress.balances[currency])))}
                        &nbsp;
                      </span>
                    )}
                    {currencyName}
                  </span>
                </div>
              </div>
              {ethFee && (
              <div className="text-right">
                <small className="text-note">
                  {' '}
                  Max Fee:
                  {ethFee}
                  {' '}
                  ETH
                </small>
              </div>
              )}
            </div>
            {values.walletAddress && (
            <InputRange
              field="range"
              min={0}
              max={100}
              disabled={!values.pairRate || values.pairRate === '0' || values.pairRate === ''}
              onChange={amount => {
                const offerAmount = values.pairRate !== '0' ? division((amount * balance), (100 * values.pairRate), 10) : 0;
                const total = multiply(offerAmount, values.pairRate, 14);

                setValue('offerAmount', offerAmount);
                setValue('total', total);
              }}
            />
            )}
            <button
              type="submit"
              // className="btn btn-green btn-lg"
              className={cn({
                'btn btn-green btn-lg': true,
                'loading btn-green-disabled': isPending,
              })}
            >
              <div className="button-loader">
                <div className="ball-pulse">
                  <div />
                  <div />
                  <div />
                </div>
              </div>
              <span className="button-text">Buy APL</span>
              <div className="btn-arrow">
                <ArrowRight />
              </div>
            </button>
          </Form>
        );
      }}
    </Formik>
  );
}

// class BuyForm extends React.PureComponent {
// state = {
//     isPending: false,
//     form: null,
//     currentCurrency: null,
//     wallet: null,
//     walletsList: null,
// };

// static getDerivedStateFromProps(props, state) {

//     if (props.currentCurrency && (props.currentCurrency.currency !== state.currentCurrency || props.wallet !== state.wallet)) {
//         if (state.form && state.form.values) {
//             state.form.setAllValues({
//                 walletAddress: state.form.values.walletAddress,
//                 pairRate: '',
//                 offerAmount: '',
//                 total: '',
//             });
//         }

//         let walletsList = props.wallet || [];
//         walletsList = walletsList.map((wallet) => (
//             {
//                 value: wallet,
//                 label: wallet.address
//             }
//         ));

//         return {
//             currentCurrency: props.currentCurrency.currency,
//             wallet: props.wallet,
//             walletsList,
//         };
//     }

//     return null;
// }

// componentDidUpdate() {
//     if(this.props.infoSelectedBuyOrder) {
//         const { pairRate, offerAmount, total } = this.props.infoSelectedBuyOrder;
//         const {currentCurrency: {currency}} = this.props;
//         const { form, wallet } = this.state;
//         const balance = wallet && wallet[0].balances[currency];
//         const normalizePairRate = !pairRate ? 0 : division(pairRate, ONE_GWEI, 9);
//         const normalizeOfferAmount = !offerAmount ? 0 : division(offerAmount, ONE_GWEI, 9);
//         const normalizeTotal = !total ? 0 : division(total, Math.pow(10, 18), 9);
//         const rangeValue = ((normalizePairRate * normalizeOfferAmount) * 100 / balance).toFixed(0);
//         form.setAllValues({
//             walletAddress: wallet && wallet[0],
//             pairRate: normalizePairRate,
//             offerAmount: normalizeOfferAmount,
//             total: normalizeTotal,
//             range: rangeValue === 'NaN' ? 0 : rangeValue > 100 ? 100 : rangeValue,
//         });
//     }
// }

// handleFormSubmit = (values) => {
//     if (!this.state.isPending) {
//         const pairRateInfo = multiply(values.pairRate, ONE_GWEI);
//         const offerAmountInfo = multiply(values.offerAmount, ONE_GWEI);
//         const totalInfo = pairRateInfo * offerAmountInfo;
//         this.props.setSelectedOrderInfo({
//             pairRate: pairRateInfo,
//             offerAmount: offerAmountInfo,
//             total: totalInfo,
//             type: 'BUY',
//         });
//         this.setPending();
//         if (this.props.wallet) {
//             if (values.offerAmount > 0 && values.pairRate > 0) {
//                 const {currentCurrency: {currency}} = this.props;
//                 const balance = values.walletAddress && values.walletAddress.balances[currency];
//                 let isError = false;
//                 if (+values.pairRate < 0.000000001) {
//                     NotificationManager.error(`Price must be more then 0.000000001 ${currency.toUpperCase()}`, 'Error', 5000);
//                     isError = true;
//                 }
//                 if (+values.offerAmount < 0.001) {
//                     NotificationManager.error('You can buy more then 0.001 APL', 'Error', 5000);
//                     isError = true;
//                 }
//                 if (!values.walletAddress || !values.walletAddress.balances) {
//                     NotificationManager.error('Please select wallet address', 'Error', 5000);
//                     isError = true;
//                 }
//                 if (+values.total > +balance) {
//                     NotificationManager.error(`You need more ${currency.toUpperCase()}. Please check your wallet balance.`, 'Error', 5000);
//                     isError = true;
//                 }
//                 // if (!this.props.ethFee || +this.props.ethFee === 0) {
//                 //     NotificationManager.error('Can\'t get Gas fee. Something went wrong. Please, try again later', 'Error', 5000);
//                 //     isError = true;
//                 // }
//                 if (+this.props.ethFee > +values.walletAddress.balances.eth) {
//                     NotificationManager.error(`To buy APL you need to have at least ${this.props.ethFee.toLocaleString('en', {
//                         minimumFractionDigits: 0,
//                         maximumFractionDigits: 9
//                     })} ETH on your balance to confirm transaction`, 'Error', 5000);
//                     isError = true;
//                 }
//                 if (isError) {
//                     this.setPending(false);
//                     return;
//                 }
//                 const pairRate = Math.round(multiply(values.pairRate, ONE_GWEI));
//                 const offerAmount = multiply(values.offerAmount, ONE_GWEI);
//                 const balanceETH = parseFloat(values.walletAddress.balances[currency]);
//                 const balanceAPL = (this.props.dashboardAccoountInfo && this.props.dashboardAccoountInfo.unconfirmedBalanceATM) ?
//                     parseFloat(this.props.dashboardAccoountInfo.unconfirmedBalanceATM)
//                     :
//                     parseFloat(this.props.balanceAPL);
//                 const fixedOfferAmount = offerAmount.toFixed();
//                 const checkFee = currency === 'eth' ? values.total + this.props.ethFee : this.props.ethFee;
//                 if (checkFee > balanceETH) {
//                     NotificationManager.error(`Not enough founds on your ETH balance. You need to pay Gas fee`, 'Error', 5000);
//                     this.setPending(false);
//                     return;
//                 }
//                 if (balanceETH === 0 || balanceETH < values.total) {
//                     NotificationManager.error(`Not enough founds on your ${currency.toUpperCase()} balance.`, 'Error', 5000);
//                     this.setPending(false);
//                     return;
//                 }
//                 if (!this.props.balanceAPL || balanceAPL === 0 || balanceAPL < this.feeATM) {
//                     NotificationManager.error('Not enough funds on your APL balance. You need to pay 2 APL fee.', 'Error', 5000);
//                     this.setPending(false);
//                     return;
//                 }
//                 const params = {
//                     offerType: 0, // BUY
//                     pairCurrency: currencyTypes[currency],
//                     pairRate,
//                     offerAmount: fixedOfferAmount,
//                     sender: this.props.account,
//                     passphrase: this.props.passPhrase,
//                     feeATM: this.feeATM,
//                     walletAddress: values.walletAddress.address,
//                 };
//                 if (this.props.passPhrase) {
//                     this.props.createOffer(params).then(() => {
//                         this.setPending(false);
//                     });
//                     if (this.state.form) {
//                         this.props.resetTrade();
//                         this.state.form.setAllValues({
//                             walletAddress: values.walletAddress,
//                             pairRate: '',
//                             offerAmount: '',
//                             total: '',
//                         });
//                     }
//                 } else {
//                     this.props.setBodyModalParamsAction('CONFIRM_CREATE_OFFER', {
//                         params,
//                         resetForm: () => {
//                             this.props.resetTrade();
//                             this.state.form.setAllValues({
//                             walletAddress: values.walletAddress,
//                             pairRate: '',
//                             offerAmount: '',
//                             total: '',
//                         })}
//                     });
//                     this.setPending(false);
//                 }
//             } else {
//                 NotificationManager.error('Price and amount are required', 'Error', 5000);
//                 this.setPending(false);
//             }
//         } else {
//             this.setPending(false);
//             this.props.handleLoginModal();
//         }
//     }
// };

// setPending = (value = true) => this.setState({isPending: value})

// getFormApi = (form) => {
//     this.setState({form})
// };

// render() {
// const {currentCurrency: {currency}} = this.props;
//         const currencyName = currency.toUpperCase();
//         return (
//             <Form
//                 onSubmit={values => this.handleFormSubmit(values)}
//                 getApi={this.getFormApi}
//                 render={({
//                              submitForm, setValue, values
//                          }) => {
//                     let balance = values.walletAddress && values.walletAddress.balances[currency];
//                     balance = currency === 'eth' ? balance - this.props.ethFee : balance;
//                     balance = balance < 0 ? 0 : balance;
//                     return (
//                         <form
//                             className="form-group-app d-flex flex-column justify-content-between h-100 mb-0"
//                             onSubmit={submitForm}
//                         >
//                             {this.state.walletsList && !!this.state.walletsList.length && (
//                                 <div className="form-group mb-3">
//                                     <label>
//                                         {currencyName} Wallet
//                                     </label>
//                                     <CustomSelect
//                                         className="form-control"
//                                         field={'walletAddress'}
//                                         defaultValue={this.state.walletsList[0]}
//                                         setValue={setValue}
//                                         options={this.state.walletsList}
//                                     />
//                                 </div>
//                             )}
//                             <div className="form-group mb-3">
//                                 <label>
//                                     Price for 1 APL
//                                 </label>
//                                 <div className="input-group">
//                                     <InputForm
//                                         field="pairRate"
//                                         type={"float"}
//                                         onChange={(price) => {
//                                             const amount = values.offerAmount || 0;
//                                             let rangeValue = ((amount * price) * 100 / balance).toFixed(0)
//                                             if (rangeValue > 100) rangeValue = 100
//                                             setValue("offerAmount", amount);
//                                             setValue("range", rangeValue === 'NaN' ? 0 : rangeValue)
//                                             setValue("total", multiply(amount, price));
//                                         }}
//                                         setValue={setValue}
//                                         disableArrows
//                                     />
//                                     <div className="input-group-append">
//                                         <span className="input-group-text">{currencyName}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="form-group mb-3">
//                                 <label>
//                                     I want to Buy
//                                 </label>
//                                 <div
//                                     className="input-group">
//                                     <InputForm
//                                         field="offerAmount"
//                                         type={"float"}
//                                         onChange={(amount) => {
//                                             const pairRate = +values.pairRate || 0;
//                                             let rangeValue = ((amount * pairRate) * 100 / balance).toFixed(0)
//                                             if (rangeValue > 100) rangeValue = 100
//                                             setValue("offerAmount", amount);
//                                             setValue("range", rangeValue === 'NaN' ? 0 : rangeValue);
//                                             setValue("total", multiply(amount, pairRate));
//                                         }}
//                                         // maxValue={values.pairRate ? balance/values.pairRate : null}
//                                         setValue={setValue}
//                                         disableArrows
//                                     />
//                                     <div className="input-group-append">
//                                         <span className="input-group-text">APL</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="form-group mb-3">
//                                 <label>
//                                     I will pay
//                                 </label>
//                                 <div className="input-group">
//                                     <InputForm
//                                         field="total"
//                                         type={"float"}
//                                         setValue={setValue}
//                                         disabled/>
//                                     <div className="input-group-append">
//                                     <span className="input-group-text">
//                                         {values.walletAddress && (
//                                             <span className={'input-group-info-text'}><i
//                                                 className="zmdi zmdi-balance-wallet"/>&nbsp;
//                                                 {(getFullNumber(Number(values.walletAddress.balances[currency])))}
//                                                 &nbsp;</span>
//                                         )}
//                                         {currencyName}</span>
//                                     </div>
//                                 </div>
//                                 {this.props.ethFee && (
//                                     <div className={'text-right'}>
//                                         <small className={'text-note'}> Max Fee: {this.props.ethFee} ETH</small>
//                                     </div>
//                                 )}
//                             </div>
//                             {values.walletAddress && (
//                                 <InputRange
//                                     field="range"
//                                     min={0}
//                                     max={100}
//                                     disabled={!values.pairRate || values.pairRate === '0' || values.pairRate === ''}
//                                     onChange={(amount) => {
//                                         const offerAmount = values.pairRate !== '0' ? division((amount * balance), (100 * values.pairRate), 10) : 0;
//                                         const total = multiply(offerAmount, values.pairRate, 14);

//                                         setValue("offerAmount", offerAmount);
//                                         setValue("total", total);
//                                     }}
//                                 />
//                             )}
//                             <button
//                                 type={'submit'}
//                                 className={'btn btn-green btn-lg'}
//                                 className={classNames({
//                                     "btn btn-green btn-lg": true,
//                                     "loading btn-green-disabled": this.state.isPending,
//                                 })}
//                             >
//                                 <div className="button-loader">
//                                     <div className="ball-pulse">
//                                         <div/>
//                                         <div/>
//                                         <div/>
//                                     </div>
//                                 </div>
//                                 <span className={'button-text'}>Buy APL</span>
//                                 <div className={'btn-arrow'}>
//                                     <ArrowRight/>
//                                 </div>
//                             </button>
//                         </form>
//                     )
//                 }}
//             />
//         )
//     }
// }

// const mapStateToProps = ({account, dashboard, exchange, modals}) => ({
//     account: account.account,
//     passPhrase: account.passPhrase,
//     balanceAPL: account.unconfirmedBalanceATM,
//     dashboardAccoountInfo: dashboard.dashboardAccoountInfo,
//     infoSelectedBuyOrder: modals.infoSelectedBuyOrder,
//     currentCurrency: exchange.currentCurrency,
// });

// const mapDispatchToProps = dispatch => ({
//     createOffer: (params) => dispatch(createOffer(params)),
//     resetTrade: () => dispatch(resetTrade()),
//     setBodyModalParamsAction: (type, value) => dispatch(setBodyModalParamsAction(type, value)),
//     setSelectedOrderInfo: (params) => dispatch(setSelectedOrderInfo(params)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(BuyForm);
