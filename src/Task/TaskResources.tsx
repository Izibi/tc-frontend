
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';

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
    const {loaded, contestId} = this.props;
    if (!loaded) {
      return <p>{"Not loaded"}</p>;
    }
    const {resources, currentResource} = this.props;
    const resourceOptions = resources.map((resource, index) =>
      <TaskResourceOption key={index} resource={resource} index={index} contestId={contestId} selected={currentResource === resource} />);
    return (
      <div>
        <ContestHeader/>
        <div>
          {resourceOptions}
        </div>
        <div>
          {currentResource && <iframe src={currentResource.url} />}
        </div>
      </div>
    );
  }
}

type TaskResourceOptionProps = {
  index: number,
  contestId: string,
  selected: boolean,
  resource: TaskResource,
}
const TaskResourceOption : React.StatelessComponent<TaskResourceOptionProps> = (props) => {
  const {index, contestId, selected, resource} = props;
  return (
    <div className={selected ? "selected" : ""} title={resource.description}>
      <Link to="TaskResources" params={{contestId: contestId, resourceIndex: index}}>
        {resource.title}
      </Link>
    </div>
  );
};

export default connect(mapStateToProps)(TaskResourcesPage);
