
import * as React from 'react';
import {connect} from 'react-redux';

import {DispatchProp} from '../app';
import {TaskResource} from '../types';
import {Header as ContestHeader} from '../Contest';
import {Link} from '../router';

import {TaskState, TaskResourcesParams} from './types';

type StoreProps = {
  resources: TaskResource[] | undefined,
  currentResource: TaskResource | undefined,
}

type Props = TaskResourcesParams & StoreProps & DispatchProp

function mapStateToProps (state: TaskState, props: TaskResourcesParams): StoreProps {
  const {task_resources} = state;
  const {resourceIndex} = props;
  let currentResource: TaskResource | undefined;
  if (task_resources) {
    currentResource = task_resources[parseInt(resourceIndex)];
  }
  return {resources: task_resources, currentResource};
}

class TaskResourcesPage extends React.PureComponent<Props> {
  render () {
    const {contestId} = this.props;
    const {resources, currentResource} = this.props;
    let resourceOptions : JSX.Element[] | undefined;
    if (resources) {
      resourceOptions = resources.map((resource, index) =>
        <TaskResourceOption key={index} resource={resource} index={index} contestId={contestId} selected={currentResource === resource} />);
      resourceOptions.reverse(); // Shoot your graphist.
    }
    return (
      <div>
        <ContestHeader/>
        <div className="tabLayout">
          <div className="tabSelector">
            {resourceOptions}
          </div>
          <div className="pageContent">
            {currentResource && 'url' in currentResource && <iframe src={currentResource.url} />}
            {currentResource && 'html' in currentResource && <iframe srcDoc={currentResource.html}/>}
          </div>
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
      <Link to="TaskResources" params={{contestId: contestId, resourceIndex: index}} text={resource.title} />
    </div>
  );
};

export default connect(mapStateToProps)(TaskResourcesPage);
