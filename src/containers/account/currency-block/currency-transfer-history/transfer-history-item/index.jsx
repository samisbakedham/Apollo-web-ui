/** ****************************************************************************
 * Copyright © 2018 Apollo Foundation                                         *
 *                                                                            *
 ***************************************************************************** */

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBodyModalParamsAction } from '../../../../../modules/modals';
import { formatTimestamp } from '../../../../../helpers/util/time';
import { getTransactionAction } from '../../../../../actions/transactions';
import { Tooltip } from '../../../../components/tooltip';
import RedIcon from '../../../../../assets/red-triangle.svg'
import styles from './index.module.scss';

export default function TransferHistoryItem(props) {
  const dispatch = useDispatch();
  const [currency, setCurrency] = useState(null);

  const {
    transfer, code, timestamp, senderRS, sender,
    units, decimals = 0, recipient, recipientRS,
  } = props;

  useEffect(() => {
    dispatch(getTransactionAction({
      transaction: transfer,
    })).then(({ attachment }) => {
      setCurrency(attachment);
    })
  }, [dispatch, transfer]);

  const unitsHandler = useCallback(() => {
    const result = units / (10 ** decimals);
    if(result > 1e-7) return result;
    
    return result.toFixed(decimals);
  }, [units, decimals]);

  const name = code ? (
    <Link to={"/exchange-booth/" + code}>{code}</Link>
    ) : (
      <>
        <span className={styles.emptyCurrencyCode}>{currency && currency.currency}</span>
        <Tooltip icon={RedIcon}>
            <div>
                This currency has been removed
            </div> 
        </Tooltip>
      </>
    );

  const unitsTooltip = !decimals && !code && (
    <Tooltip icon={RedIcon}>
      <div>
        This currency has been removed. Units is without decimals convertation.
      </div> 
    </Tooltip>
  );

  return (
    <tr key={uuidv4()}>
      <td>
        <span
          className="blue-link-text"
          onClick={() => dispatch(setBodyModalParamsAction('INFO_TRANSACTION', transfer))}
        >
          {transfer}
        </span>
      </td>
      <td className="blue-link-text">
        {name}
      </td>
      <td className="">{formatTimestamp(timestamp)}</td>
      <td className="align-right">{unitsHandler()} {unitsTooltip}</td>
      <td>
        <span
          className="blue-link-text"
          onClick={() => dispatch(setBodyModalParamsAction('INFO_ACCOUNT', recipient))}
        >
          {recipientRS}
        </span>
      </td>
      <td>
        <span
          className="blue-link-text"
          onClick={() => dispatch(setBodyModalParamsAction('INFO_ACCOUNT', sender))}
        >
          {senderRS}
        </span>
      </td>
    </tr>
  );
}
