/******************************************************************************
 * Copyright © 2018 Apollo Foundation                                         *
 *                                                                            *
 ******************************************************************************/

import React, { useState, useCallback, useEffect } from "react";
import SiteHeader from "../../components/site-header";
import { ContractTableItem } from "./contract-table-item";
import { useDispatch } from "react-redux";
import { getContracts } from "../../../actions/contracts";
import { setBodyModalParamsAction } from "../../../modules/modals";
import CustomTable from "../../components/tables/table";
import { Link } from "react-router-dom";
import { Form, Formik } from "formik";
import CustomFormSelect from "../../components/form-components/custom-form-select";
import SearchField from "../../components/form-components/search-field";

const STATUS_DATA = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "CLOSED", label: "CLOSED" },
  { value: "DESTROYED", label: "DESTROYED" },
];

export default function SmartContracts() {
  const dispatch = useDispatch();

  const [contractList, setContractList] = useState([]);
  const [searchQuery, setSearchQuery] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    firstIndex: 0,
    lastIndex: 15,
  });

  const getContractsList = useCallback(async () => {
    const myContracts = await dispatch(
      getContracts({
        firstIndex: pagination.firstIndex,
        lastIndex: pagination.lastIndex,
        searchQuery,
      })
    );
    if (myContracts) {
      setContractList(myContracts.contracts);
    }
  }, [dispatch, pagination, searchQuery]);

  useEffect(() => {
    getContractsList();
  }, [pagination, searchQuery]);

  const onPaginate = (currentPage) => {
    setPagination({
      page: currentPage,
      firstIndex: currentPage * 15 - 15,
      lastIndex: currentPage * 15,
    });
  };

  const prevPaginate = () => onPaginate(pagination.page - 1);

  const nextPaginate = () => onPaginate(pagination.page + 1);

  const handleSendMessage = () => {
    dispatch(setBodyModalParamsAction("SMC_CREATE", {}));
  };

  const handleSearch = (values) => {
    setSearchQuery({ ...values, ...searchQuery });
  };

  const handleChangeStatus = (value) => {
    handleSearch({ ...searchQuery, status: value });
  };

  return (
    <div className="page-content">
      <SiteHeader pageTitle={"Smart Contracts"}>
        <Link
          to={"/smart-contracts/create"}
          className="btn btn-green btn-sm ml-3"
        >
          Create New Contract
        </Link>
        <button
          type={"button"}
          className="btn btn-green btn-sm ml-3"
          onClick={handleSendMessage}
        >
          Send message
        </button>
      </SiteHeader>
      <div className="page-body container-fluid">
        <div className="row">
          <div className="col-md-12 p-0 mb-15">
            <div className="transactions-filters p-0">
              <div className="search-bar">
                <Formik onSubmit={handleSearch} initialValues={{}}>
                  {({ values, setValue }) => {
                    return (
                      <Form className="form-group-app input-group-app transparent mb-0 row">
                        <div className="col-md-6 col-lg p-0 pr-lg-3">
                          <SearchField
                            name={"address"}
                            field="address"
                            placeholder="address"
                            setValue={setValue}
                          />
                        </div>
                        <div className="col-md-6 col-lg p-0 pr-lg-3">
                          <SearchField
                            name={"publisher"}
                            field="publisher"
                            placeholder="Publisher"
                            setValue={setValue}
                          />
                        </div>
                        <div className="col-md-6 col-lg p-0 pr-lg-3">
                          <SearchField
                            name={"name"}
                            field="name"
                            placeholder="Name"
                            setValue={setValue}
                          />
                        </div>

                        <div className="col-md-6 col-lg p-0">
                          <CustomFormSelect
                            placeholder={"Status"}
                            options={STATUS_DATA}
                            field={"status"}
                            setValue={setValue}
                            onChange={handleChangeStatus}
                          />
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
          <CustomTable
            header={[
              {
                name: "Adress",
                alignRight: false,
              },
              {
                name: "Name",
                alignRight: false,
              },
              {
                name: "Args",
                alignRight: false,
              },
              {
                name: "Fuels limit/price",
                alignRight: false,
              },
              {
                name: "Transaction id",
                alignRight: false,
              },
              {
                name: "Amount",
                alignRight: false,
              },
              {
                name: "Short Hash",
                alignRight: false,
              },
              {
                name: "Published",
                alignRight: false,
              },
              {
                name: "Status",
                alignRight: false,
              },
              {
                name: "Action",
                alignRight: true,
              },
            ]}
            className={"no-min-height mb-3"}
            emptyMessage={"No Smart Contracts found."}
            page={pagination.page}
            TableRowComponent={ContractTableItem}
            tableData={contractList}
            isPaginate
            previousHendler={prevPaginate}
            nextHendler={nextPaginate}
            itemsPerPage={15}
          />
        </div>
      </div>
    </div>
  );
}
