
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';

import {TaskState, TaskResourcesParams} from './types';

type StoreProps = {
  loaded: boolean,
  resources: TaskResource[],
  currentResource: undefined | TaskResource,
}

type Props = TaskResourcesParams & StoreProps & DispatchProp

function mapStateToProps (state: TaskState, props: TaskResourcesParams): StoreProps {
  let loaded = false;
  let resources: TaskResource[] = [];
  const page = state.task_resources_page;
  const {resourceIndex} = props;
  if (page) {
    loaded = page.loaded;
    resources = page.resources;
  }
  let currentResource : undefined | TaskResource;
  if (loaded) {
    currentResource = resources[parseInt(resourceIndex)];
  }
  return {loaded, resources, currentResource};
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
