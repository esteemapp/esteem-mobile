import React, { Component } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import AppCenter from 'appcenter';
import Push from 'appcenter-push';
import { Client } from 'dsteem';

// Realm
import {
  setTheme,
  setLanguage as setLanguage2DB,
  setCurrency as setCurrency2DB,
  setServer,
  setNotificationSettings,
  getExistUser,
  setNsfw as setNsfw2DB,
} from '../../../realm/realm';

// Services and Actions
import {
  setLanguage,
  changeNotificationSettings,
  setCurrency,
  setApi,
  isDarkTheme,
  openPinCodeModal,
  setNsfw,
} from '../../../redux/actions/applicationActions';
import { toastNotification } from '../../../redux/actions/uiAction';
import { setPushToken, getNodes } from '../../../providers/esteem/esteem';
import { checkClient } from '../../../providers/steem/dsteem';
// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';

// Utilities

// Component
import SettingsScreen from '../screen/settingsScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serverList: [],
      isNotificationMenuOpen: props.isNotificationSettingsOpen,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    getNodes()
      .then((resp) => {
        this.setState({ serverList: resp });
      })
      .catch(() => {});
  }

  // Component Functions
  _handleDropdownSelected = (action, actionType) => {
    const { dispatch } = this.props;

    switch (actionType) {
      case 'currency':
        this._currencyChange(action);
        break;

      case 'language':
        dispatch(setLanguage(LANGUAGE_VALUE[action]));
        setLanguage2DB(LANGUAGE_VALUE[action]);
        break;

      case 'api':
        this._changeApi(action);
        break;

      case 'nsfw':
        dispatch(setNsfw(action));
        setNsfw2DB(action);
        break;

      default:
        break;
    }
  };

  _changeApi = async (action) => {
    const { dispatch, selectedApi } = this.props;
    const { serverList } = this.state;
    const server = serverList[action];
    let serverResp;
    let isError = false;
    const client = new Client(server, { timeout: 3000 });

    dispatch(setApi(server));

    try {
      serverResp = await client.database.getDynamicGlobalProperties();
    } catch (e) {
      isError = true;
      dispatch(toastNotification('Connection Failed!'));
    } finally {
      if (!isError) dispatch(toastNotification('Succesfuly connected!'));
    }

    if (!isError) {
      const localTime = new Date(new Date().toISOString().split('.')[0]);
      const serverTime = new Date(serverResp.time);
      const isAlive = localTime - serverTime < 15000;

      if (!isAlive) {
        dispatch(toastNotification('Server not available'));
        isError = true;

        return;
      }
    }

    if (isError) {
      dispatch(setApi(selectedApi));
    } else {
      await setServer(server);
      checkClient();
    }
  };

  _currencyChange = (action) => {
    const { dispatch } = this.props;

    dispatch(setCurrency(CURRENCY_VALUE[action]));
    setCurrency2DB(CURRENCY_VALUE[action]);
  };

  _handleToggleChanged = (action, actionType) => {
    const { dispatch } = this.props;

    switch (actionType) {
      case 'notification':
      case 'notification.follow':
      case 'notification.vote':
      case 'notification.comment':
      case 'notification.mention':
      case 'notification.reblog':
      case 'notification.transfers':
        this._handleNotification(action, actionType);
        break;

      case 'theme':
        dispatch(isDarkTheme(action));
        setTheme(action);
        break;
      default:
        break;
    }
  };

  _handleNotification = async (action, actionType) => {
    const { dispatch, notificationDetails } = this.props;
    const notifyTypesConst = {
      vote: 1,
      mention: 2,
      follow: 3,
      comment: 4,
      reblog: 5,
      transfers: 6,
    };
    const notifyTypes = [];

    dispatch(changeNotificationSettings({ action, type: actionType }));
    setNotificationSettings({ action, type: actionType });

    if (actionType === 'notification') {
      await Push.setEnabled(action);
      this._setPushToken(action ? [1, 2, 3, 4, 5, 6] : notifyTypes);
    } else {
      Object.keys(notificationDetails).map((item) => {
        const notificationType = item.replace('Notification', '');

        if (notificationType === actionType.replace('notification.', '')) {
          if (action) {
            notifyTypes.push(notifyTypesConst[notificationType]);
          }
        } else if (notificationDetails[item]) {
          notifyTypes.push(notifyTypesConst[notificationType]);
        }
      });
      this._setPushToken(notifyTypes);
    }
  };

  _handleButtonPress = (action, actionType) => {
    const { dispatch, setPinCodeState } = this.props;
    switch (actionType) {
      case 'pincode':
        setPinCodeState({ isReset: true });
        dispatch(openPinCodeModal());
        break;
      default:
        break;
    }
  };

  _handleOnChange = (action, type, actionType = null) => {
    switch (type) {
      case 'dropdown':
        this._handleDropdownSelected(action, actionType);
        break;

      case 'toggle':
        this._handleToggleChanged(action, actionType);
        break;

      case 'button':
        this._handleButtonPress(action, actionType);
        break;

      default:
        break;
    }
  };

  _setPushToken = async (notifyTypes) => {
    const { isNotificationSettingsOpen, isLoggedIn, username } = this.props;

    if (isLoggedIn) {
      const token = await AppCenter.getInstallId();

      getExistUser().then((isExistUser) => {
        if (isExistUser) {
          const data = {
            username,
            token,
            system: Platform.OS,
            allows_notify: Number(isNotificationSettingsOpen),
            notify_types: notifyTypes,
          };
          setPushToken(data);
        }
      });
    }
  };

  render() {
    const { serverList, isNotificationMenuOpen } = this.state;

    return (
      <SettingsScreen
        serverList={serverList}
        handleOnChange={this._handleOnChange}
        isNotificationMenuOpen={isNotificationMenuOpen}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  selectedLanguage: state.application.language,
  selectedApi: state.application.api,
  selectedCurrency: state.application.currency,
  isDarkTheme: state.application.isDarkTheme,
  isNotificationSettingsOpen: state.application.isNotificationOpen,
  isLoggedIn: state.application.isLoggedIn,
  username: state.account.currentAccount && state.account.currentAccount.name,
  nsfw: state.application.nsfw,
  notificationDetails: state.application.notificationDetails,
  commentNotification: state.application.notificationDetails.commentNotification,
  followNotification: state.application.notificationDetails.followNotification,
  mentionNotification: state.application.notificationDetails.mentionNotification,
  reblogNotification: state.application.notificationDetails.reblogNotification,
  transfersNotification: state.application.notificationDetails.transfersNotification,
  voteNotification: state.application.notificationDetails.voteNotification,
});

export default connect(mapStateToProps)(SettingsContainer);
