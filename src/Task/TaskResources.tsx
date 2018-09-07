
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';

import {TaskState, TaskResourcesParams} from './types';

type StoreProps = {
  resources: TaskResource[],
  currentResource: undefined | TaskResource,
}

type Props = TaskResourcesParams & StoreProps & DispatchProp

function mapStateToProps (state: TaskState, props: TaskResourcesParams): StoreProps {
  let resources: TaskResource[] = [];
  const page = state.task_resources_page;
  let currentResource: undefined | TaskResource;
  const {resourceIndex} = props;
  if (page) {
    resources = page.resources;
    currentResource = resources[parseInt(resourceIndex)];
  }
  return {resources, currentResource};
}

class TaskResourcesPage extends React.PureComponent<Props> {
  render () {
    const {contestId} = this.props;
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
