import { mdiKeyboardBackspace } from '@mdi/js'
import Field from 'components/Field'
import Layout from 'components/Layout'
import { RnText } from 'components/Rn'
import { currentVersion } from 'components/variables'
import filesize from 'filesize'
import { observer } from 'mobx-react'
import moment from 'moment'
import styles from 'pages/PageSettingDebug/Styles'
import React, { Component } from 'react'
import { Platform } from 'react-native'
import debugStore from 'stores/debugStore'
import intl from 'stores/intl'
import Nav from 'stores/Nav'

@observer
class PageSettingsDebug extends Component {
  render() {
    return (
      <Layout
        description={intl`App information and debugging`}
        dropdown={
          Platform.OS !== 'web'
            ? [
                {
                  label: intl`Clear all log files`,
                  onPress: debugStore.clearLogFiles,
                  danger: true,
                },
                {
                  label: intl`Manually check for update`,
                  onPress: debugStore.checkForUpdate,
                },
              ]
            : undefined
        }
        onBack={Nav().backToPageProfileSignIn}
        title={intl`Debug`}
      >
        {Platform.OS !== 'web' && (
          <>
            <Field isGroup label={intl`DEBUG LOG`} />
            <Field
              label={intl`CAPTURE ALL DEBUG LOG`}
              onValueChange={debugStore.toggleCaptureDebugLog}
              type='Switch'
              value={debugStore.captureDebugLog}
            />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={styles.btnIcon}
              label={intl`OPEN DEBUG LOG`}
              onCreateBtnPress={debugStore.openLogFile}
              onTouchPress={debugStore.openLogFile}
              value={filesize(debugStore.logSize, { round: 0 })}
            />

            <Field hasMargin isGroup label={intl`UPDATE`} />
            <Field
              createBtnIcon={mdiKeyboardBackspace}
              createBtnIconStyle={styles.btnIcon}
              label={intl`UPDATE`}
              onCreateBtnPress={debugStore.openInStore}
              onTouchPress={debugStore.openInStore}
              value={intl`Open Brekeke Phone on store`}
            />
            <RnText
              normal
              primary={!debugStore.isUpdateAvailable}
              small
              style={styles.text}
              warning={debugStore.isUpdateAvailable}
            >
              {intl`Current version: ${currentVersion}`}
              {'\n'}
              {debugStore.isCheckingForUpdate
                ? intl`Checking for update...`
                : debugStore.isUpdateAvailable
                ? intl`A new version is available: ${debugStore.remoteVersion}`
                : intl`Brekeke Phone is up-to-date, checked ${moment(
                    debugStore.remoteVersionLastCheck,
                  ).fromNow()}`}
            </RnText>
          </>
        )}
        {Platform.OS === 'web' && (
          <>
            <RnText normal primary small style={styles.text}>
              {intl`Current version: ${currentVersion}`}
            </RnText>
            <RnText normal warning small style={styles.text}>
              {intl`You are running an in-browser version of Brekeke Phone`}
            </RnText>
          </>
        )}
      </Layout>
    )
  }
}

export default PageSettingsDebug
