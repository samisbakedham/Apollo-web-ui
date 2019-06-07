import React from 'react';
import {connect} from 'react-redux';
import CircularProgressbar from 'react-circular-progressbar';
import classNames from 'classnames';
import './BlocksDownloader.scss'

const maStateToProps = state => ({
    blockchainStatus: state.account.blockchainStatus,
    actualBlock: state.account.actualBlock
});

const BlocksDownloader = ({blockchainStatus, actualBlock}) => {
    const percentage = blockchainStatus && actualBlock && (parseInt(actualBlock) / parseInt(blockchainStatus.lastBlockchainFeederHeight) * 100);

    return (
        <div className={'wrap-block-downloader'}>
            {blockchainStatus.status && blockchainStatus.status.tasks.map(task => (
                (task.stateOfTask !== "Finished" && task.isCrititcal) ? (
                    <div key={task.id} className={'block-downloader'}>
                        <CircularProgressbar
                            className={classNames({
                                'Downloader': true,
                            })}
                            percentage={task.percentComplete}
                            text={`${task.percentComplete.toFixed(2)}%`}
                            styles={{
                                path: {
                                    stroke: `rgba(62, 152, 199, ${Math.floor(task.percentComplete / 100)})`,
                                    strokeLinecap: 'butt',
                                },
                                text: {fill: '#f88', fontSize: '16px'},
                            }}
                            style={{
                                margin: 0,
                                height: 70
                            }}
                            strokeWidth={12}
                        />
                        <div className="block-downloader_text">
                            {task.name}
                        </div>
                    </div>
                ) : null
            ))}
            {blockchainStatus && actualBlock && blockchainStatus.isDownloading ? (
                <div className={'block-downloader'}>
                    <CircularProgressbar
                        className={classNames({
                            'Downloader': true,
                        })}
                        percentage={percentage}
                        text={`${percentage.toFixed(2)}%`}
                        styles={{
                            path: {
                                stroke: `rgba(62, 152, 199, ${percentage / 100})`,
                                strokeLinecap: 'butt',
                            },
                            text: {fill: '#f88', fontSize: '16px'},
                        }}
                        style={{
                            margin: 0,
                            height: 70
                        }}
                        strokeWidth={12}
                    />
                    <div className="block-downloader_text">
                        Downloading blocks
                    </div>
                </div>
            ) : null}
        </div>
    )
};


export default connect(maStateToProps, null)(BlocksDownloader)