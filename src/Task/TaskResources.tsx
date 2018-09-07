
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp, actionCreators} from '../app';
import {TaskResource} from '../types';
import {TaskState} from './types';

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

type Props = RouteProps & StoreProps & DispatchProp

function mapStateToProps (state: TaskState, _props: RouteProps): StoreProps {
  const {loaded, resources, currentIndex} = state.task_resources_page;
  let currentResource : undefined | TaskResource;
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
    const resourceOptions = resources.map((resource, index) =>
      <TaskResourceOption key={index} resource={resource} index={index} onSelect={this.handleResourceSelected} />);
    return (
      <div>
        <div>
          {resourceOptions}
        </div>
        <div>
          {currentResource && <iframe src={currentResource.url} />}
        </div>
      </div>
    );
  }
  handleResourceSelected = (index: number) => {
    this.props.dispatch(actionCreators.taskResourceSelected(index));
  };
}

type TaskResourceOptionProps = {
  index: number,
  resource: TaskResource,
  onSelect: (index: number) => void
}
class TaskResourceOption extends React.PureComponent<TaskResourceOptionProps> {
  render () {
    const {resource} = this.props;
    return (
      <div title={resource.description} onClick={this.handleSelect}>
        {resource.title}
      </div>
    );
  }
  handleSelect = () => {
    this.props.onSelect(this.props.index);
  };
}

export default connect(mapStateToProps)(TaskResourcesPage);
