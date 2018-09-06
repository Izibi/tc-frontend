
import * as React from 'react';
import {connect} from 'react-redux';

import {State, TaskResource} from './types';

type RouteProps = {
  contestId: string,
  resourceIndex: string,
}

type StoreProps = {
  loaded: boolean,
  resources: TaskResource[],
  currentIndex: number,
  currentResource: undefined | TaskResource,
}

type Props = RouteProps & StoreProps

function mapStateToProps (state: State, _props: RouteProps): StoreProps {
  const {loaded, resources, currentIndex} = state.task_resources_page;
  let currentResource;
  if (loaded) {
    currentResource = resources[currentIndex];
  }
  return {loaded, resources, currentIndex, currentResource};
}

class TaskResourcesPage extends React.PureComponent<Props> {
  render () {
    const {loaded} = this.props;
    if (!loaded) {
      return <p>{"Not loaded"}</p>;
    }
    const {resources, currentResource} = this.props;
    return (
      <div>
        <div>
          {resources.map((resource, i) =>
            <div key={i} title={resource.description}>
              {resource.title}
            </div>)}
        </div>
        <div>
          {currentResource && <iframe src={currentResource.url} />}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(TaskResourcesPage);
