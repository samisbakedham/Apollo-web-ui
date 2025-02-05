import React from 'react';

export default function CurrencyInfo(props) {
  const {
    currentSupply, decimals, code, maxSupply,
    currency, description, accountRS,
  } = props;

  return (
    <div className="col-md-3 col-sm-4 p-0">
      <div className="card mb-3 custom-height">
        <div className="card-title card-title-lg bg-primary">
          <span className="title-lg">
            {code}
          </span>
        </div>
        <div className="card-body">
          <div className="form-group-app d-flex flex-column justify-content-between h-100">
            <p className="mb-3">
              <label>
                Current supply:
              </label>
              <div>
                {currentSupply / (10 ** decimals)}
                {' '}
                {code}
              </div>
            </p>
            <p className="mb-3">
              <label>
                Max supply:
              </label>
              <div>
                {maxSupply / (10 ** decimals)}
                {' '}
                {code}
              </div>
            </p>
            <p className="mb-3">
              <label>
                Description:
              </label>
              <div>
                {description}
              </div>
            </p>
            <p className="mb-3">
              <label>
                Account:
              </label>
              <div>
                {accountRS}
              </div>
            </p>
            <p className="mb-3">
              <label>
                Currency ID:
              </label>
              <div>
                {currency}
              </div>
            </p>
            <p>
              <label>
                Currency decimals:
              </label>
              <div>
                {decimals}
              </div>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
