import _ from 'underscore';
import React from 'react-native';

var {
  ListView,
  ScrollView,
  StyleSheet,
  View
} = React;

import Api from '../Utils/Api';
import CustomRefreshControl from '../Helpers/CustomRefreshControl';
import EmptyResults from '../Components/EmptyResults';
import Loading from '../Components/Loading';
import RepoItem from '../Components/RepoItem';
import SearchBar from '../Components/SearchBar';

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  separator: {
    height: 2,
    backgroundColor: '#e9e9e9'
  }
});

export default class ReposScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2});
    this.state = {
      clearSearch: false,
      loading: false,
      refreshing: false,
      repos: [],
      reposSource: ds.cloneWithRows([])
    };
  }

  componentWillMount() {
    this.setState({
      clearSearch: false,
      loading: true
    });

    this.fetchData(false);
  }

  fetchData(refresh) {
    if (refresh) {
      this.setState({
        clearSearch: true,
        refreshing: true
      });
    } else {
      this.setState({
        clearSearch: true,
        loading: true
      });
    }

    const self = this;
    Api.getRepos(this.props.username, this.props.isPro)
      .then(function (res) {
        var repos = _.filter(res.repos, function(obj) {
          return obj.active === true;
        });
        repos = _.sortBy(repos, 'last_build_finished_at');
        repos.reverse();

        if (refresh) {
          self.setState({
            refreshing: false,
            repos: repos,
            reposSource: self.state.reposSource.cloneWithRows(repos)
          });
        } else {
          self.setState({
            loading: false,
            repos: repos,
            reposSource: self.state.reposSource.cloneWithRows(repos)
          });
        }
      });
  }

  _renderBuildRow(rowData: string, sectionID: number, rowID: number) {
    return (
      <RepoItem
        details={rowData}
        isPro={this.props.isPro}
        navigator={this.props.navigator} />
    );
  }

  _renderSeparator(
    sectionID: number | string, rowID: number | string, adjacentRowHighlighted: boolean
  ) {
    return (
      <View key={'SEP_' + sectionID + '_' + rowID} style={styles.separator} />
    );
  }

  searchRepos(keyword) {
    var results = _.filter(this.state.repos, function (obj) {
      return obj.slug.split('/')[1].indexOf(keyword) > -1;
    });

    this.setState({
      reposSource: this.state.reposSource.cloneWithRows(results)
    });
  }

  _renderHeader(refreshingIndicator) {
    return (
      <View>
        {refreshingIndicator}
        <SearchBar search={this.searchRepos.bind(this)} clear={this.state.clearSearch} />
      </View>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <Loading text="Repositories" />
      );
    }

    if (_.isEmpty(this.state.repos)) {
      return (
        <EmptyResults />
      );
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <CustomRefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.fetchData.bind(this, true)} />
        }>
        <ListView
          contentContainerStyle={styles.listViewContainer}
          dataSource={this.state.reposSource}
          renderHeader={this._renderHeader.bind(this)}
          renderRow={this._renderBuildRow.bind(this)}
          renderSeparator={this._renderSeparator} />
      </ScrollView>
    );
  }
};