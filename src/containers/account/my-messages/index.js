/******************************************************************************
 * Copyright © 2018 Apollo Foundation                                         *
 *                                                                            *
 ******************************************************************************/


import React from 'react';
import uuid from "uuid";
import classNames from "classnames";
import SiteHeader from "../../components/site-header"
import MessageItem from './message-item'
import {connect} from 'react-redux';
import {setBodyModalParamsAction} from "../../../modules/modals";
import {BlockUpdater} from "../../block-subscriber/index";
import InfoBox from "../../components/info-box";
import ContentLoader from '../../components/content-loader'
import ContentHendler from '../../components/content-hendler'

import CustomTable from '../../components/tables/table';
import {getMessagesPerpage} from '../../../modules/messages'

const mapStateToProps = state => ({
    account: state.account.account
});

const mapDispatchToProps = dispatch => ({
    getMessagesPerpage: (reqParams) => dispatch(getMessagesPerpage(reqParams)),
    setBodyModalParamsAction: (type, data, valueForModal) => dispatch(setBodyModalParamsAction(type, data, valueForModal)),
});

class MyMessages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            firstIndex: 0,
            lastIndex: 14,
            messages: null,
            isLoading: false,
            account: null
        };
    }

    componentDidMount() {
        this.props.getMessagesPerpage({firstIndex: 0, lastIndex: 14})
        
        // BlockUpdater.on("data", data => {
        //     console.warn("height in dashboard", data);
        //     console.warn("updating dashboard");
        //     this.updateMessangerData();
        // });
    }

    componentDidUpdate = (nextProps) => {
        if (nextProps.account) {
            this.props.getMessagesPerpage({firstIndex: 0, lastIndex: 14})
        }
    }

    componentWillUnmount() {
        BlockUpdater.removeAllListeners('data');
    }

    onPaginate = (page) => {
        let reqParams = {
            account: this.props.account,
            page: page,
            firstIndex: page * 15 - 15,
            lastIndex: page * 15 - 1
        };


        this.setState(reqParams, () => {
            this.getMessages(reqParams)
        });
    }

    render() {
        const {messages, page} = this.state;

        return (
            <div className="page-content">
                <SiteHeader
                    pageTitle={'My messages'}
                >
                    <a
                        onClick={() => this.props.setBodyModalParamsAction('COMPOSE_MESSAGE', null)}
                        className="btn primary"
                    >
                        Compose message
                    </a>
                </SiteHeader>
                <div className="page-body container-fluid">
                    <CustomTable 
                        header={[
                            {
                                name: 'Date',
                                alignRight: false
                            },{
                                name: 'From',
                                alignRight: false
                            },{
                                name: 'To',
                                alignRight: false
                            },{
                                name: 'Message',
                                alignRight: false
                            },{
                                name: 'Action',
                                alignRight: true
                            }
                        ]}
                        page={page}
                        TableRowComponent={MessageItem}
                        tableData={messages}
                        isPaginate
                        previousHendler={this.onPaginate.bind(this, this.state.page - 1)}
                        nextHendler={this.onPaginate.bind(this, this.state.page + 1)}
                    />
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyMessages);