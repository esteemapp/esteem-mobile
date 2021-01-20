import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { useIntl } from 'react-intl';

// Components
import {
  ListPlaceHolder,
  EmptyScreen,
  UserListItem,
} from '../../../../../../components/basicUIElements';
import PeopleResultsContainer from '../container/peopleResultsContainer';

import styles from './peopleResultsStyles';

const PeopleResults = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  return (
    <PeopleResultsContainer searchValue={searchValue}>
      {({ users, handleOnPress, noResult }) => (
        <SafeAreaView style={styles.container}>
          {noResult ? (
            <EmptyScreen />
          ) : (
            <FlatList
              data={users}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <UserListItem
                  handleOnPress={() => handleOnPress(item)}
                  index={index}
                  username={item}
                />
              )}
              ListEmptyComponent={_renderEmptyContent}
            />
          )}
        </SafeAreaView>
      )}
    </PeopleResultsContainer>
  );
};

export default PeopleResults;